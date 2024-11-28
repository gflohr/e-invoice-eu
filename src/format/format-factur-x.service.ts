import { Injectable } from '@nestjs/common';

import { FormatCIIService, FULL_CII, FXProfile } from './format-cii.service';
import { EInvoiceFormat } from './format.e-invoice-format.interface';
import { Invoice } from '../invoice/invoice.interface';
import { InvoiceServiceOptions } from '../invoice/invoice.service';

@Injectable()
export class FormatFacturXService
	extends FormatCIIService
	implements EInvoiceFormat
{
	get mimeType(): string {
		return 'application/pdf';
	}

	get fxProfile(): FXProfile {
		return FULL_CII;
	}

	generate(invoice: Invoice, options: InvoiceServiceOptions): string | Buffer {
		if (options.pdf) {
			options.pdf = this.generatePDF3A(options.data as Buffer);
		} else if (options.data) {

		} else {
			throw new Error(
				'Either a data spreadsheet file or an invoice PDF' +
					' are mandatory for Factur-X invoices!',
			);
		}

		const xml = super.generate(invoice, options);

		return options.pdf as Buffer;
	}

	// const ghostscriptCommand = `gs -dPDFA=3 -dBATCH -dNOPAUSE -sDEVICE=pdfwrite -sOutputFile=${outputPath} PDFA_def.ps ${tempPath}`;
	private generatePDF3A(pdf: Buffer): Buffer {
		return Buffer.from('todo');
	}
}
