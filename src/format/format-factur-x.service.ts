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
		if (!options.data && !options.pdf) {
			throw new Error(
				'Either a data spreadsheet file or an invoice PDF' +
					' are mandatory for Factur-X invoices!',
			);
		}
		const xml = super.generate(invoice, options);

		return xml;
	}
}
