import { Injectable, Logger } from '@nestjs/common';
import { spawn } from 'child_process';

import { FormatCIIService, FULL_CII, FXProfile } from './format-cii.service';
import { EInvoiceFormat } from './format.e-invoice-format.interface';
import { Invoice } from '../invoice/invoice.interface';
import { InvoiceServiceOptions } from '../invoice/invoice.service';
import { AFRelationship, PDFDocument } from 'pdf-lib';

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
			pdf = await this.generatePDF3A(options.pdf as Buffer);
		} else if (options.data) {
			pdf = Buffer.from('TODO!');
		} else {
			throw new Error(
				'Either a data spreadsheet file or an invoice PDF' +
					' are mandatory for Factur-X invoices!',
			);
		}

		const xml = await super.generate(invoice, options) as string;
		pdf = await this.attachFacturX(pdf as Buffer, xml);

		return pdf as Buffer;
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

	private async generatePDF3A(pdf: Buffer): Promise<Buffer> {
		const gs = this.appConfigService.get('programs').gs;
		const args = [
			'-dPDFA=3',
			'-dBATCH',
			'-dNOPAUSE',
			'-sDEVICE=pdfwrite',
			'-sOutputFile=-',
			'PDFA_def.ps',
			'-',
		];

		this.logger.log(
			`Invoking GhostScript binary '${gs}' with arguments '${args}' to generate PDF/A-3`,
		);

		return new Promise<Buffer>((resolve, reject) => {
			const child = spawn(gs, args);

			const chunks: Buffer[] = [];
			let stderr = '';

			child.stdin.write(pdf);
			child.stdin.end();

			child.stdout.on('data', chunk => chunks.push(chunk));

			child.stderr.on('data', data => {
				stderr += data.toString();
			});

			child.on('close', code => {
				if (code === 0) {
					this.logger.log(`GhostScript successfully generated PDF/A-3`);
					resolve(Buffer.concat(chunks));
				} else {
					this.logger.error(`GhostScript failed with code ${code}: ${stderr}`);
					reject(new Error(`GhostScript error: ${stderr}`));
				}
			});

			child.on('error', error => {
				this.logger.error(`Error executing GhostScript: ${error.message}`);
				reject(error);
			});
		});
	}
}
