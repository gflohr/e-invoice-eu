import { Injectable, Logger } from '@nestjs/common';
import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import * as path from 'path';
import { AFRelationship, PDFDocument, PDFHexString, PDFName } from 'pdf-lib';
import * as tmp from 'tmp-promise';
import * as url from 'url';
import { create } from 'xmlbuilder2';
import { XMLBuilder } from 'xmlbuilder2/lib/interfaces';

import { FormatCIIService, FULL_CII, FXProfile } from './format-cii.service';
import { EInvoiceFormat } from './format.e-invoice-format.interface';
import * as packageJson from '../../package.json';
import { Invoice } from '../invoice/invoice.interface';
import { InvoiceServiceOptions } from '../invoice/invoice.service';

type InvoiceMeta = {
	now: string;
	creator: string;
	producer: string;
	subject: string;
}

@Injectable()
export class FormatFacturXService
	extends FormatCIIService
	implements EInvoiceFormat
{
	private readonly logger = new Logger(FormatFacturXService.name);

	get mimeType(): string {
		return 'application/pdf';
	}

	get fxProfile(): FXProfile {
		return FULL_CII;
	}

	async generate(
		invoice: Invoice,
		options: InvoiceServiceOptions,
	): Promise<string | Buffer> {
		let pdf: Buffer;

		if (options.pdf) {
			pdf = options.pdf;
		} else if (options.data) {
			pdf = await this.getPdfFromSpreadsheet(options.data, options.dataName as string);
		} else {
			throw new Error(
				'Either a data spreadsheet file or an invoice PDF' +
					' are mandatory for Factur-X invoices!',
			);
		}

		// TODO! Attach other files!

		const xml = await super.generate(invoice, options) as string;
		pdf = await this.attachFacturX(pdf, xml);

		pdf = await this.createPDFA(pdf, invoice);

		return pdf as Buffer;
	}

	private async createPDFA(pdf: Buffer, invoice: Invoice): Promise<Buffer> {
		// Currently: details passedRules="141" failedRules="4" passedChecks="13839" failedChecks="346"
		const pdfDoc = await PDFDocument.load(pdf, { updateMetadata: false });

		let xmp = create();
		xmp = xmp.ins('xpacket', 'begin="" id="W5M0MpCehiHzreSzNTczkc9d"');

		const now = new Date();
		const invoiceNumber = invoice['ubl:Invoice']['cbc:ID'];
		const invoiceCreator = invoice['ubl:Invoice']['cac:AccountingSupplierParty']['cac:Party']['cac:PartyLegalEntity']['cbc:RegistrationName'];
		const invoiceDate = invoice['ubl:Invoice']['cbc:IssueDate'];
		const invoiceSubject = `Invoice ${invoiceNumber} dated ${invoiceDate} issued by ${invoiceCreator}`;
		const invoiceMeta = {
			creator: invoiceCreator,
			now: this.formatDateWithOffset(now),
			producer: `${packageJson.name} - ${packageJson.homepage}`,
			subject: invoiceSubject,
		};

		this.addXmpMeta(xmp, invoiceMeta);
		xmp = xmp.ins('xpacket', 'end="w"');

		pdfDoc.setAuthor(invoiceMeta.creator);
		pdfDoc.setCreationDate(now);
		pdfDoc.setCreator(invoiceMeta.producer);
		pdfDoc.setKeywords(['Invoice', 'Factur-X']);
		pdfDoc.setLanguage('');
		pdfDoc.setModificationDate(now);
		pdfDoc.setProducer(invoiceMeta.producer);
		pdfDoc.setSubject(invoiceSubject);
		pdfDoc.setTitle(`${invoiceCreator}: Invoice ${invoiceNumber}`);

		this.setTrailerInfoID(pdfDoc, invoiceMeta);

		this.addMetadata(pdfDoc, xmp.end({
			prettyPrint: true,
			indent: '\t',
			headless: true,
		}));

		return Buffer.from(await pdfDoc.save());
	}

	private async setTrailerInfoID(pdfDoc: PDFDocument, invoiceMeta: InvoiceMeta) {
		const encoder = new TextEncoder();
		const data = invoiceMeta.subject;
		const hash = await crypto.subtle.digest('SHA-512', encoder.encode(data));
		const hashArray = Array.from(new Uint8Array(hash));
		const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
		const permanent = PDFHexString.of(hashHex);
		const changing = permanent;
		pdfDoc.context.trailerInfo.ID = pdfDoc.context.obj([permanent, changing]);
	}

	private addXmpMeta(node: XMLBuilder, invoiceMeta: InvoiceMeta) {
		this.addRdf(node.ele('x:xmpmeta', { 'xmlns:x': 'adobe:ns:meta/' }), invoiceMeta);
	}

	private addRdf(node: XMLBuilder, invoiceMeta: InvoiceMeta) {
		const rdf = node.ele('rdf:RDF', { 'xmlns:rdf': 'http://www.w3.org/1999/02/22-rdf-syntax-ns#' });
		this.addPdfAidDescription(rdf);
		this.addPdfPurl(rdf, invoiceMeta);
		this.addProducer(rdf);
		this.addXap(rdf);
		this.addPdfAExtension(rdf);
		this.addFacturXStuff(rdf);
	}

	private addPdfAidDescription(node: XMLBuilder) {
		node.ele('rdf:Description', { 'xmlns:pdfaid': 'http://www.aiim.org/pdfa/ns/id/', 'rdf:about': ''})
			.ele('pdfaid:part')
			// FIXME! Use the correct version!
			.txt('3')
			.up()
			.ele('pdfaid:conformance')
			.txt('B');
	}

	private addPdfPurl(node: XMLBuilder, invoiceMeta: InvoiceMeta) {
		node.ele('rdf:Description', { 'xmlns:dc': 'http://purl.org/dc/elements/1.1/', 'rdf:about': ''})
			.ele('dc:format')
			.txt('application/pdf')
			.up()
			.ele('dc:date')
			.ele('rdf:Seq')
			.ele('rdf:li')
			.txt(invoiceMeta.now)
			.up()
			.up()
			.up()
			// FIXME! Only do this, when the document has a creator! Alternatively,
			// get the creator from the invoice data.
			.ele('dc:creator')
			.ele('rdf:Seq')
			.ele('rdf:li')
			.txt(invoiceMeta.creator);
	}

	private addProducer(node: XMLBuilder) {
		node.ele('rdf:Description', { 'xmlns:pdf': 'http://ns.adobe.com/pdf/1.3/', 'rdf:about': ''})
			.ele('pdf:Producer')
			.txt('gflohr/e-invoice-eu git+https://github.com/gflohr/e-invoice-eu')
			.up()
			.ele('pdf:PDFVersion')
			// FIXME! Use correct PDF version!
			.txt('1.7');
	}

	private addXap(node: XMLBuilder) {
		node.ele('rdf:Description', { 'xmlns:xmp': 'http://ns.adobe.com/xap/1.0/', 'rdf:about': ''})
			.ele('xmp:CreatorTool')
			// FIXME!
			.txt('gflohr/e-invoice-eu git+https://github.com/gflohr/e-invoice-eu')
			.up()
			.ele('xmp:CreateDate')
			// FIXME! Use current date and time!
			.txt('2024-11-26T12:08:03+02:00')
			.up()
			.ele('xmp:ModifyDate')
			// FIXME! Use current date and time!
			.txt('2024-11-26T12:08:03+02:00')
			.up()
			.ele('xmp:MetadataDate')
			// FIXME! Use current date and time!
			.txt('2024-11-26T12:08:03+02:00')
			.up()
	}

	private addPdfAExtension(node: XMLBuilder) {
		node.ele('rdf:Description', {
			'xmlns:pdfaExtension': 'http://www.aiim.org/pdfa/ns/extension/',
			'xmlns:pdfaSchema': 'http://www.aiim.org/pdfa/ns/schema#',
			'xmlns:pdfaProperty': 'http://www.aiim.org/pdfa/ns/property#',
			'rdf:about': '',
		})
		.ele('pdfaExtension:schemas')
		.ele('rdf:Bag')
		.ele('rdf:li', { 'rdf:parseType': 'Resource' })
		.ele('pdfaSchema:schema')
		.txt('Factur-X PDFA Extension Schema')
		.up()
		.ele('pdfaSchema:namespaceURI')
		// FIXME! Is that constant for all profiles?
		.txt('urn:factur-x:pdfa:CrossIndustryDocument:invoice:1p0#')
		.up()
		.ele('pdfaSchema:prefix')
		.txt('fx')
		.up()
		.ele('pdfaSchema:property')
		.ele('rdf:Seq')
		.ele('rdf:li', { 'rdf:parseType': 'Resource'})
		.ele('pdfaProperty:name')
		.txt('DocumentFileName')
		.up()
		.ele('pdfaProperty:valueType')
		.txt('Text')
		.up()
		.ele('pdfaProperty:category')
		.txt('external')
		.up()
		.ele('pdfaProperty:description')
		.txt('The name of the embedded XML document')
		.up()
		.up()
		.ele('rdf:li', { 'rdf:parseType': 'Resource'})
		.ele('pdfaProperty:name')
		.txt('DocumentType')
		.up()
		.ele('pdfaProperty:valueType')
		.txt('Text')
		.up()
		.ele('pdfaProperty:category')
		.txt('external')
		.up()
		.ele('pdfaProperty:description')
		.txt('The type of the hybrid document in capital letters, e.g. INVOICE or ORDER')
		.up()
		.up()
		.ele('rdf:li', { 'rdf:parseType': 'Resource'})
		.ele('pdfaProperty:name')
		.txt('Version')
		.up()
		.ele('pdfaProperty:valueType')
		.txt('Text')
		.up()
		.ele('pdfaProperty:category')
		.txt('external')
		.up()
		.ele('pdfaProperty:description')
		.txt('The actual version of the standard applying to the embedded XML document')
		.up()
		.up()
		.ele('rdf:li', { 'rdf:parseType': 'Resource'})
		.ele('pdfaProperty:name')
		.txt('ConformanceLevel')
		.up()
		.ele('pdfaProperty:valueType')
		.txt('Text')
		.up()
		.ele('pdfaProperty:category')
		.txt('external')
		.up()
		.ele('pdfaProperty:description')
		.txt('The conformance level of the embedded XML document')
		.up()
		.up()
		;
	}

	private addFacturXStuff(node: XMLBuilder) {
		node.ele('rdf:Description', {
			'xmlns:fx': 'urn:factur-x:pdfa:CrossIndustryDocument:invoice:1p0#"',
			'rdf:about': '',
		})
		.ele('fx:DocumentType')
		.txt('INVOICE')
		.up()
		.ele('fx:DocumentFileName')
		.txt('factur-x.xml')
		.up()
		.ele('fx:Version')
		.txt('1.0')
		.up()
		.ele('fx:ConformanceLevel')
		// FIXME! Use fxProfile here!
		.txt('EXTENDED')
		.up()
		;
	}

	private formatDateWithOffset(date: Date): string {
		const isoString = date.toISOString().split('.')[0]; // Remove milliseconds

		const offsetMinutes = date.getTimezoneOffset();

		const offsetHours = Math.floor(Math.abs(offsetMinutes) / 60);
		const offsetMin = Math.abs(offsetMinutes) % 60;

		const offsetSign = offsetMinutes <= 0 ? '+' : '-';
		const formattedOffset = `${offsetSign}${String(offsetHours).padStart(2, '0')}:${String(offsetMin).padStart(2, '0')}`;

		return `${isoString}${formattedOffset}`;
	  }

	  private addMetadata(pdfDoc: PDFDocument, xmp: string) {
		const metadataStream = pdfDoc.context.stream(xmp, {
			Type: 'Metadata',
			Subtype: 'XML',
			Length: xmp.length,
		});

		const metadataStreamRef = pdfDoc.context.register(metadataStream);

		pdfDoc.catalog.set(PDFName.of('Metadata'), metadataStreamRef);
	}

	private async attachFacturX(pdf: Buffer, xml: string): Promise<Buffer> {
		try {
			const pdfDoc = await PDFDocument.load(pdf);

			pdfDoc.attach(Buffer.from(xml), 'factur-x.xml', {
				mimeType: 'application/xml',
				description: 'Factur-X',
				creationDate: new Date(),
				modificationDate: new Date(),
				afRelationship: AFRelationship.Alternative,
			});

			const modifiedPdfBytes = await pdfDoc.save();

			return Buffer.from(modifiedPdfBytes);
		  } catch (error) {
			console.error("Error attaching string to PDF:", error);
			throw new Error("Error modifying PDF");
		  }
	}

	private async getPdfFromSpreadsheet(spreadsheet: Buffer, filename: string): Promise<Buffer> {
		const libreoffice = this.appConfigService.get('programs').libreOffice;
		const userDir = await tmp.tmpName();
		const userDirUrl = url.pathToFileURL(path.resolve(userDir));
		const parsedOriginalFilename = path.parse(filename);
		const inputFilename = (await tmp.file({ postfix: parsedOriginalFilename.ext })).path;
		await fs.writeFile(inputFilename, spreadsheet);
		const outputDir = (await tmp.dir()).path;

		const args = [
			'--headless',
			`-env:UserInstallation=${userDirUrl.href}`,
			'--convert-to',
			'pdf',
			'--outdir',
			outputDir,
			inputFilename,
		];
		this.logger.log(`Executing command '${libreoffice}' with args '${args.join(' ')}'`);

		await new Promise<void>((resolve, reject) => {
			const child = spawn(libreoffice, args, { stdio: 'inherit' });

			child.on('error', (err) => {
				this.logger.error(`Error spawning process: ${err.message}`);
				reject(err);
			});

			child.on('close', (code) => {
				if (code === 0) {
					this.logger.log(`LibreOffice command executed successfully`);
					resolve();
				} else {
					const errorMsg = `LibreOffice command failed with exit code ${code}`;
					this.logger.error(errorMsg);
					reject(new Error(errorMsg));
				}
			});
		});

		const parsedInputFilename = path.parse(inputFilename);
		const outputFilename = path.join(outputDir, parsedInputFilename.name + '.pdf');

		this.logger.log(`Reading converted file from '${outputFilename}'`);

		try {
			const pdfBuffer = await fs.readFile(outputFilename);
			return pdfBuffer;
		} catch (error) {
			this.logger.error(`Error reading output PDF: ${error.message}`);
			throw error;
		}
	}
}
