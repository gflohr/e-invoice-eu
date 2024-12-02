import { Injectable } from '@nestjs/common';

import { Invoice } from './invoice.interface';
import { FormatFactoryService } from '../format/format.factory.service';

export type InvoiceAttachment = {
	/**
	 * The uploaded file.
	 */
	file: Express.Multer.File;

	/**
	 * A description.
	 */
	description?: string;
};

export type InvoiceServiceOptions = {
	/**
	 * The invoice format like `XRECHNUNG-UBL` or `Factur-X-Extended`.
	 */
	format: string;

	/**
	 * The spreadsheet data.
	 */
	data?: Buffer;

	/**
	 * The filename of the spreadsheet data.
	 */
	dataName?: string;

	/**
	 * A PDF version of the invoice.  For Factur-X, either `data` or `pdf`
	 * must be present.
	 */
	pdf?: Buffer;

	/**
	 * An array of supplementary attachments.
	 */
	attachments: InvoiceAttachment[];

	/**
	 * True if invoice should be embedded in XML, ignored for Factur-X.
	 */
	embedPDF?: boolean;
};

@Injectable()
export class InvoiceService {
	constructor(private readonly formatFactoryService: FormatFactoryService) {}

	async generate(
		invoice: Invoice,
		options: InvoiceServiceOptions,
	): Promise<string | Buffer> {
		const formatter = this.formatFactoryService.createFormatService(
			options.format,
		);

		return formatter.generate(invoice, options);
	}
}
