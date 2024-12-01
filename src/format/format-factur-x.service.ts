import { Injectable, Logger } from '@nestjs/common';
import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import * as path from 'path';
import {
	AFRelationship,
	PDFArray,
	PDFDict,
	PDFDocument,
	PDFHexString,
	PDFName,
	PDFNumber,
	PDFString,
} from 'pdf-lib';
import * as tmp from 'tmp-promise';
import * as url from 'url';
import { create } from 'xmlbuilder2';
import { XMLBuilder } from 'xmlbuilder2/lib/interfaces';

import { FormatCIIService, FULL_CII, FXProfile } from './format-cii.service';
import { EInvoiceFormat } from './format.e-invoice-format.interface';
import * as packageJson from '../../package.json';
import { Invoice } from '../invoice/invoice.interface';
import { InvoiceServiceOptions } from '../invoice/invoice.service';

type FacturXConformanceLevel =
	| 'MINIMUM'
	| 'BASIC'
	| 'BASIC WL'
	| 'EN 16931'
	| 'EXTENDED'
	| 'XRECHNUNG';

type FacturXFilename = 'factur-x.xml' | 'xrechnung.xml';

type InvoiceMeta = {
	conformanceLevel: FacturXConformanceLevel;
	version: string;
	filename: FacturXFilename;
	now: string;
	creator: string;
	producer: string;
	subject: string;
};

const colourProfile = `
AAAL0AAAAAACAAAAbW50clJHQiBYWVogB98AAgAPAAAAAAAAYWNzcAAAAAAAAAAAAAAAAAAAAAAA
AAABAAAAAAAAAAAAAPbWAAEAAAAA0y0AAAAAPQ6y3q6Tl76bZybOjApDzgAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAQZGVzYwAAAUQAAABjYlhZWgAAAagAAAAUYlRSQwAAAbwAAAgMZ1RS
QwAAAbwAAAgMclRSQwAAAbwAAAgMZG1kZAAACcgAAACIZ1hZWgAAClAAAAAUbHVtaQAACmQAAAAU
bWVhcwAACngAAAAkYmtwdAAACpwAAAAUclhZWgAACrAAAAAUdGVjaAAACsQAAAAMdnVlZAAACtAA
AACHd3RwdAAAC1gAAAAUY3BydAAAC2wAAAA3Y2hhZAAAC6QAAAAsZGVzYwAAAAAAAAAJc1JHQjIw
MTQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFhZWiAAAAAAAAAkoAAAD4QAALbPY3VydgAAAAAAAAQA
AAAABQAKAA8AFAAZAB4AIwAoAC0AMgA3ADsAQABFAEoATwBUAFkAXgBjAGgAbQByAHcAfACBAIYA
iwCQAJUAmgCfAKQAqQCuALIAtwC8AMEAxgDLANAA1QDbAOAA5QDrAPAA9gD7AQEBBwENARMBGQEf
ASUBKwEyATgBPgFFAUwBUgFZAWABZwFuAXUBfAGDAYsBkgGaAaEBqQGxAbkBwQHJAdEB2QHhAekB
8gH6AgMCDAIUAh0CJgIvAjgCQQJLAlQCXQJnAnECegKEAo4CmAKiAqwCtgLBAssC1QLgAusC9QMA
AwsDFgMhAy0DOANDA08DWgNmA3IDfgOKA5YDogOuA7oDxwPTA+AD7AP5BAYEEwQgBC0EOwRIBFUE
YwRxBH4EjASaBKgEtgTEBNME4QTwBP4FDQUcBSsFOgVJBVgFZwV3BYYFlgWmBbUFxQXVBeUF9gYG
BhYGJwY3BkgGWQZqBnsGjAadBq8GwAbRBuMG9QcHBxkHKwc9B08HYQd0B4YHmQesB78H0gflB/gI
CwgfCDIIRghaCG4IggiWCKoIvgjSCOcI+wkQCSUJOglPCWQJeQmPCaQJugnPCeUJ+woRCicKPQpU
CmoKgQqYCq4KxQrcCvMLCwsiCzkLUQtpC4ALmAuwC8gL4Qv5DBIMKgxDDFwMdQyODKcMwAzZDPMN
DQ0mDUANWg10DY4NqQ3DDd4N+A4TDi4OSQ5kDn8Omw62DtIO7g8JDyUPQQ9eD3oPlg+zD88P7BAJ
ECYQQxBhEH4QmxC5ENcQ9RETETERTxFtEYwRqhHJEegSBxImEkUSZBKEEqMSwxLjEwMTIxNDE2MT
gxOkE8UT5RQGFCcUSRRqFIsUrRTOFPAVEhU0FVYVeBWbFb0V4BYDFiYWSRZsFo8WshbWFvoXHRdB
F2UXiReuF9IX9xgbGEAYZRiKGK8Y1Rj6GSAZRRlrGZEZtxndGgQaKhpRGncanhrFGuwbFBs7G2Mb
ihuyG9ocAhwqHFIcexyjHMwc9R0eHUcdcB2ZHcMd7B4WHkAeah6UHr4e6R8THz4faR+UH78f6iAV
IEEgbCCYIMQg8CEcIUghdSGhIc4h+yInIlUigiKvIt0jCiM4I2YjlCPCI/AkHyRNJHwkqyTaJQkl
OCVoJZclxyX3JicmVyaHJrcm6CcYJ0kneierJ9woDSg/KHEooijUKQYpOClrKZ0p0CoCKjUqaCqb
Ks8rAis2K2krnSvRLAUsOSxuLKIs1y0MLUEtdi2rLeEuFi5MLoIuty7uLyQvWi+RL8cv/jA1MGww
pDDbMRIxSjGCMbox8jIqMmMymzLUMw0zRjN/M7gz8TQrNGU0njTYNRM1TTWHNcI1/TY3NnI2rjbp
NyQ3YDecN9c4FDhQOIw4yDkFOUI5fzm8Ofk6Njp0OrI67zstO2s7qjvoPCc8ZTykPOM9Ij1hPaE9
4D4gPmA+oD7gPyE/YT+iP+JAI0BkQKZA50EpQWpBrEHuQjBCckK1QvdDOkN9Q8BEA0RHRIpEzkUS
RVVFmkXeRiJGZ0arRvBHNUd7R8BIBUhLSJFI10kdSWNJqUnwSjdKfUrESwxLU0uaS+JMKkxyTLpN
Ak1KTZNN3E4lTm5Ot08AT0lPk0/dUCdQcVC7UQZRUFGbUeZSMVJ8UsdTE1NfU6pT9lRCVI9U21Uo
VXVVwlYPVlxWqVb3V0RXklfgWC9YfVjLWRpZaVm4WgdaVlqmWvVbRVuVW+VcNVyGXNZdJ114Xcle
Gl5sXr1fD19hX7NgBWBXYKpg/GFPYaJh9WJJYpxi8GNDY5dj62RAZJRk6WU9ZZJl52Y9ZpJm6Gc9
Z5Nn6Wg/aJZo7GlDaZpp8WpIap9q92tPa6dr/2xXbK9tCG1gbbluEm5rbsRvHm94b9FwK3CGcOBx
OnGVcfByS3KmcwFzXXO4dBR0cHTMdSh1hXXhdj52m3b4d1Z3s3gReG54zHkqeYl553pGeqV7BHtj
e8J8IXyBfOF9QX2hfgF+Yn7CfyN/hH/lgEeAqIEKgWuBzYIwgpKC9INXg7qEHYSAhOOFR4Wrhg6G
cobXhzuHn4gEiGmIzokziZmJ/opkisqLMIuWi/yMY4zKjTGNmI3/jmaOzo82j56QBpBukNaRP5Go
khGSepLjk02TtpQglIqU9JVflcmWNJaflwqXdZfgmEyYuJkkmZCZ/JpomtWbQpuvnByciZz3nWSd
0p5Anq6fHZ+Ln/qgaaDYoUehtqImopajBqN2o+akVqTHpTilqaYapoum/adup+CoUqjEqTepqaoc
qo+rAqt1q+msXKzQrUStuK4trqGvFq+LsACwdbDqsWCx1rJLssKzOLOutCW0nLUTtYq2AbZ5tvC3
aLfguFm40blKucK6O7q1uy67p7whvJu9Fb2Pvgq+hL7/v3q/9cBwwOzBZ8Hjwl/C28NYw9TEUcTO
xUvFyMZGxsPHQce/yD3IvMk6ybnKOMq3yzbLtsw1zLXNNc21zjbOts83z7jQOdC60TzRvtI/0sHT
RNPG1EnUy9VO1dHWVdbY11zX4Nhk2OjZbNnx2nba+9uA3AXcit0Q3ZbeHN6i3ynfr+A24L3hROHM
4lPi2+Nj4+vkc+T85YTmDeaW5x/nqegy6LzpRunQ6lvq5etw6/vshu0R7ZzuKO6070DvzPBY8OXx
cvH/8ozzGfOn9DT0wvVQ9d72bfb794r4Gfio+Tj5x/pX+uf7d/wH/Jj9Kf26/kv+3P9t//9kZXNj
AAAAAAAAAC5JRUMgNjE5NjYtMi0xIERlZmF1bHQgUkdCIENvbG91ciBTcGFjZSAtIHNSR0IAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAWFlaIAAAAAAAAGKZAAC3hQAAGNpYWVogAAAAAAAAAAAAUAAAAAAA
AG1lYXMAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlhZWiAAAAAAAAAAngAAAKQAAACH
WFlaIAAAAAAAAG+iAAA49QAAA5BzaWcgAAAAAENSVCBkZXNjAAAAAAAAAC1SZWZlcmVuY2UgVmll
d2luZyBDb25kaXRpb24gaW4gSUVDIDYxOTY2LTItMQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWFla
IAAAAAAAAPbWAAEAAAAA0y10ZXh0AAAAAENvcHlyaWdodCBJbnRlcm5hdGlvbmFsIENvbG9yIENv
bnNvcnRpdW0sIDIwMTUAAHNmMzIAAAAAAAEMRAAABd////MmAAAHlAAA/Y////uh///9ogAAA9sA
AMB1
`.trim();

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
			pdf = await this.getPdfFromSpreadsheet(
				options.data,
				options.dataName as string,
			);
		} else {
			throw new Error(
				'Either a data spreadsheet file or an invoice PDF' +
					' are mandatory for Factur-X invoices!',
			);
		}

		// TODO! Attach other files!

		const xml = (await super.generate(invoice, options)) as string;
		pdf = await this.attachFacturX(pdf, options, xml);

		pdf = await this.createPDFA(pdf, options, invoice);

		return pdf as Buffer;
	}

	private async createPDFA(
		pdf: Buffer,
		options: InvoiceServiceOptions,
		invoice: Invoice,
	): Promise<Buffer> {
		const pdfDoc = await PDFDocument.load(pdf, { updateMetadata: false });

		let xmp = create();
		const bom = '\uFEFF';
		xmp = xmp.ins('xpacket', `begin="${bom}" id="W5M0MpCehiHzreSzNTczkc9d"`);

		let conformanceLevel: FacturXConformanceLevel;
		let version: string;
		let filename: FacturXFilename;

		switch (options.format.toLowerCase()) {
			case 'factur-x-minimum':
				filename = 'factur-x.xml';
				conformanceLevel = 'MINIMUM';
				version = '1.0';
				break;
			case 'factur-x-basic-wl':
				filename = 'factur-x.xml';
				conformanceLevel = 'BASIC WL';
				version = '1.0';
				break;
			case 'factur-x-wasic':
				filename = 'factur-x.xml';
				conformanceLevel = 'BASIC';
				version = '1.0';
				break;
			case 'factur-x-en16931':
				filename = 'factur-x.xml';
				conformanceLevel = 'EN 16931';
				version = '1.0';
				break;
			case 'factur-x-extended':
				filename = 'factur-x.xml';
				conformanceLevel = 'EXTENDED';
				version = '1.0';
				break;
			case 'factur-x-xrechnung':
				filename = 'xrechnung.xml';
				conformanceLevel = 'XRECHNUNG';
				version = '3.0';
				break;
			default:
				throw new Error(`unknown Factur-X format '${options.format}'`);
		}

		const now = new Date();
		const invoiceNumber = invoice['ubl:Invoice']['cbc:ID'];
		const invoiceCreator =
			invoice['ubl:Invoice']['cac:AccountingSupplierParty']['cac:Party'][
				'cac:PartyLegalEntity'
			]['cbc:RegistrationName'];
		const invoiceDate = invoice['ubl:Invoice']['cbc:IssueDate'];
		const invoiceSubject = `Invoice ${invoiceNumber} dated ${invoiceDate} issued by ${invoiceCreator}`;
		const invoiceMeta = {
			conformanceLevel,
			version,
			filename,
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
		this.setOutputIntent(pdfDoc);
		this.fixLinkAnnotations(pdfDoc);
		this.setMarkInfo(pdfDoc);
		this.setStructTreeRoot(pdfDoc);

		this.addMetadata(
			pdfDoc,
			xmp.end({
				prettyPrint: true,
				indent: '\t',
				headless: true,
			}),
		);

		return Buffer.from(await pdfDoc.save());
	}

	private setStructTreeRoot(pdfDoc: PDFDocument) {
		const structTreedata = pdfDoc.context.obj({
			Type: PDFName.of('StructTreeRoot'),
		});
		const structTreeref = pdfDoc.context.register(structTreedata);
		pdfDoc.catalog.set(PDFName.of('StructTreeRoot'), structTreeref);
	}

	private setMarkInfo(pdfDoc: PDFDocument) {
		const rootref = pdfDoc.context.obj({ Marked: true });
		pdfDoc.catalog.set(PDFName.of('MarkInfo'), rootref);
	}

	private fixLinkAnnotations(pdfDoc: PDFDocument) {
		const pages = pdfDoc.getPages();
		for (const page of pages) {
			const annotations = page.node.get(PDFName.of('Annots'));

			if (annotations instanceof PDFArray) {
				for (let i = 0; i < annotations.size(); ++i) {
					const annotationRef = annotations.get(i);
					const annotation = page.node.context.lookup(annotationRef) as PDFDict;

					const subtype = annotation.get(PDFName.of('Subtype'));
					if (subtype === PDFName.of('Link')) {
						const flagsObj = annotation.get(PDFName.of('F'));
						const flags =
							flagsObj instanceof PDFNumber ? flagsObj.asNumber() : 0;

						annotation.set(PDFName.of('F'), PDFNumber.of(flags | 4));
					}
				}
			}
		}
	}

	private setOutputIntent(pdfDoc: PDFDocument) {
		const profile = this.base64ToUint8Array(colourProfile);
		const profileStream = pdfDoc.context.stream(profile, {
			Length: profile.length,
		});
		const profileStreamRef = pdfDoc.context.register(profileStream);

		const outputIntent = pdfDoc.context.obj({
			Type: 'OutputIntent',
			S: 'GTS_PDFA1',
			OutputConditionIdentifier: PDFString.of('sRGB'),
			DestOutputProfile: profileStreamRef,
		});
		const outputIntentRef = pdfDoc.context.register(outputIntent);
		pdfDoc.catalog.set(
			PDFName.of('OutputIntents'),
			pdfDoc.context.obj([outputIntentRef]),
		);
	}

	private base64ToUint8Array(base64: string): Uint8Array {
		const binaryString = atob(base64);

		const len = binaryString.length;
		const uint8Array = new Uint8Array(len);

		for (let i = 0; i < len; i++) {
			uint8Array[i] = binaryString.charCodeAt(i);
		}

		return uint8Array;
	}

	private async setTrailerInfoID(
		pdfDoc: PDFDocument,
		invoiceMeta: InvoiceMeta,
	) {
		const encoder = new TextEncoder();
		const data = invoiceMeta.subject;
		const hash = await crypto.subtle.digest('SHA-512', encoder.encode(data));
		const hashArray = Array.from(new Uint8Array(hash));
		const hashHex = hashArray
			.map(b => b.toString(16).padStart(2, '0'))
			.join('');
		const permanent = PDFHexString.of(hashHex);
		const changing = permanent;
		pdfDoc.context.trailerInfo.ID = pdfDoc.context.obj([permanent, changing]);
	}

	private addXmpMeta(node: XMLBuilder, invoiceMeta: InvoiceMeta) {
		this.addRdf(
			node.ele('x:xmpmeta', { 'xmlns:x': 'adobe:ns:meta/' }),
			invoiceMeta,
		);
	}

	private addRdf(node: XMLBuilder, invoiceMeta: InvoiceMeta) {
		const rdf = node.ele('rdf:RDF', {
			'xmlns:rdf': 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
		});
		this.addPdfAidDescription(rdf);
		this.addPdfPurl(rdf, invoiceMeta);
		this.addProducer(rdf);
		this.addXap(rdf, invoiceMeta);
		this.addPdfAExtension(rdf);
		this.addFacturXStuff(rdf, invoiceMeta);
	}

	private addPdfAidDescription(node: XMLBuilder) {
		node
			.ele('rdf:Description', {
				'xmlns:pdfaid': 'http://www.aiim.org/pdfa/ns/id/',
				'rdf:about': '',
			})
			.ele('pdfaid:part')
			.txt('3')
			.up()
			.ele('pdfaid:conformance')
			.txt('B');
	}

	private addPdfPurl(node: XMLBuilder, invoiceMeta: InvoiceMeta) {
		node
			.ele('rdf:Description', {
				'xmlns:dc': 'http://purl.org/dc/elements/1.1/',
				'rdf:about': '',
			})
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
			.ele('dc:creator')
			.ele('rdf:Seq')
			.ele('rdf:li')
			.txt(invoiceMeta.creator);
	}

	private addProducer(node: XMLBuilder) {
		node
			.ele('rdf:Description', {
				'xmlns:pdf': 'http://ns.adobe.com/pdf/1.3/',
				'rdf:about': '',
			})
			.ele('pdf:Producer')
			.txt('gflohr/e-invoice-eu git+https://github.com/gflohr/e-invoice-eu')
			.up()
			.ele('pdf:PDFVersion')
			.txt('1.7');
	}

	private addXap(node: XMLBuilder, invoiceMeta: InvoiceMeta) {
		node
			.ele('rdf:Description', {
				'xmlns:xmp': 'http://ns.adobe.com/xap/1.0/',
				'rdf:about': '',
			})
			.ele('xmp:CreatorTool')
			.txt(invoiceMeta.creator)
			.up()
			.ele('xmp:CreateDate')
			.txt(invoiceMeta.now)
			.up()
			.ele('xmp:ModifyDate')
			.txt(invoiceMeta.now)
			.up()
			.ele('xmp:MetadataDate')
			.txt(invoiceMeta.now)
			.up();
	}

	private addPdfAExtension(node: XMLBuilder) {
		node
			.ele('rdf:Description', {
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
			.txt('urn:factur-x:pdfa:CrossIndustryDocument:invoice:1p0#')
			.up()
			.ele('pdfaSchema:prefix')
			.txt('fx')
			.up()
			.ele('pdfaSchema:property')
			.ele('rdf:Seq')
			.ele('rdf:li', { 'rdf:parseType': 'Resource' })
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
			.ele('rdf:li', { 'rdf:parseType': 'Resource' })
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
			.txt(
				'The type of the hybrid document in capital letters, e.g. INVOICE or ORDER',
			)
			.up()
			.up()
			.ele('rdf:li', { 'rdf:parseType': 'Resource' })
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
			.txt(
				'The actual version of the standard applying to the embedded XML document',
			)
			.up()
			.up()
			.ele('rdf:li', { 'rdf:parseType': 'Resource' })
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
			.up();
	}

	private addFacturXStuff(node: XMLBuilder, invoiceMeta: InvoiceMeta) {
		node
			.ele('rdf:Description', {
				'xmlns:fx': 'urn:factur-x:pdfa:CrossIndustryDocument:invoice:1p0#',
				'rdf:about': '',
			})
			.ele('fx:DocumentType')
			.txt('INVOICE')
			.up()
			.ele('fx:DocumentFileName')
			.txt(invoiceMeta.filename)
			.up()
			.ele('fx:Version')
			.txt(invoiceMeta.version)
			.up()
			.ele('fx:ConformanceLevel')
			.txt(invoiceMeta.conformanceLevel)
			.up();
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

	private async attachFacturX(
		pdf: Buffer,
		options: InvoiceServiceOptions,
		xml: string,
	): Promise<Buffer> {
		try {
			const pdfDoc = await PDFDocument.load(pdf);
			const filename =
				options.format === 'factur-x-xrechnung'
					? 'xrechnung.xml'
					: 'factur-x.xml';

			pdfDoc.attach(Buffer.from(xml), filename, {
				mimeType: 'application/xml',
				description: 'Factur-X',
				creationDate: new Date(),
				modificationDate: new Date(),
				afRelationship: AFRelationship.Alternative,
			});

			const modifiedPdfBytes = await pdfDoc.save();

			return Buffer.from(modifiedPdfBytes);
		} catch (error) {
			console.error('Error attaching string to PDF:', error);
			throw new Error('Error modifying PDF');
		}
	}

	private async getPdfFromSpreadsheet(
		spreadsheet: Buffer,
		filename: string,
	): Promise<Buffer> {
		const libreoffice = this.appConfigService.get('programs').libreOffice;
		const userDir = await tmp.tmpName();
		const userDirUrl = url.pathToFileURL(path.resolve(userDir));
		const parsedOriginalFilename = path.parse(filename);
		const inputFilename = (
			await tmp.file({ postfix: parsedOriginalFilename.ext })
		).path;
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
		this.logger.log(
			`Executing command '${libreoffice}' with args '${args.join(' ')}'`,
		);

		await new Promise<void>((resolve, reject) => {
			const child = spawn(libreoffice, args, { stdio: 'inherit' });

			child.on('error', err => {
				this.logger.error(`Error spawning process: ${err.message}`);
				reject(err);
			});

			child.on('close', code => {
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
		const outputFilename = path.join(
			outputDir,
			parsedInputFilename.name + '.pdf',
		);

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
