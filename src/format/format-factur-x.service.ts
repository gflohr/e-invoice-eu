import { Injectable, Logger } from '@nestjs/common';
import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import * as path from 'path';
import { AFRelationship, PDFDocument, PDFName } from 'pdf-lib';
import * as tmp from 'tmp-promise';
import * as url from 'url';

import { FormatCIIService, FULL_CII, FXProfile } from './format-cii.service';
import { EInvoiceFormat } from './format.e-invoice-format.interface';
import { Invoice } from '../invoice/invoice.interface';
import { InvoiceServiceOptions } from '../invoice/invoice.service';


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

		pdf = await this.createPDFA(pdf);

		return pdf as Buffer;
	}

	private async createPDFA(pdf: Buffer): Promise<Buffer> {
		const pdfDoc = await PDFDocument.load(pdf);
		const xmp = this.getMetadata(pdfDoc);

		this.addMetadata(pdfDoc, xmp);

		return pdf;
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

	private getMetadata(pdfDoc: PDFDocument): string {
		const metadata = pdfDoc.catalog.lookup(PDFName.of('Metadata'));
		if (metadata) {
			const textDecoder = new TextDecoder();
			return textDecoder.decode((metadata as any).contents);
		} else {
			return `
<?xpacket begin="" id="W5M0MpCehiHzreSzNTczkc9d"?>
<x:xmpmeta xmlns:x="adobe:ns:meta/">
	<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
	<rdf:Description rdf:about=""
		xmlns:dc="http://purl.org/dc/elements/1.1/">
		<dc:title>
			<rdf:Alt>
				<rdf:li xml:lang="x-default">Invoice</rdf:li>
			</rdf:Alt>
		</dc:title>
	</rdf:Description>
	</rdf:RDF>
</x:xmpmeta>
<?xpacket end="w"?>
`;
		}
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
