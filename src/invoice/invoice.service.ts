import { Injectable } from '@nestjs/common';

import { Invoice } from './invoice.interface';
import { FormatFactoryService } from '../format/format.factory.service';

export type InvoiceAttachment = {
	/**
	 * The uploaded file.
	 */
	file: Express.Multer.File;

	/**
	 * An optional ID.
	 */
	id?: string;

	/**
	 * An optional description.
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
	data?: Express.Multer.File;

	/**
	 * A PDF version of the invoice.  For Factur-X, either `data` or `pdf`
	 * must be present.
	 */
	pdf?: Express.Multer.File;

	/**
	 * A language identifier like "fr-ca".
	 */
	lang: string;

	/**
	 * An array of supplementary attachments.
	 */
	attachments: InvoiceAttachment[];

	/**
	 * Set to invoice description if invoice should be embedded.
	 */
	embedPDF?: boolean;

	/**
	 * ID for an embedded PDF, defaults to the document id.
	 */
	pdfID?: string;

	/**
	 * Description for the embedded PDF.
	 */
	pdfDescription?: string;
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
