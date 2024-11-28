import { Injectable } from '@nestjs/common';

import { FormatCIIService, FULL_CII, FXProfile } from './format-cii.service';
import { EInvoiceFormat } from './format.e-invoice-format.interface';
import { Invoice } from '../invoice/invoice.interface';

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

	generate(invoice: Invoice): string | Buffer {
		const xml = super.generate(invoice);

		return xml;
	}
}
