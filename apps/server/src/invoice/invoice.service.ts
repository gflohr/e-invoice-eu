import {
	InvoiceService as CoreInvoiceService,
	InvoiceServiceOptions as CoreInvoiceServiceOptions,
} from '@e-invoice-eu/core';
import { Injectable, Logger } from '@nestjs/common';

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

type InvoiceServiceOptions = {
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
	private readonly logger = new Logger(InvoiceService.name);

	async generate(
		input: unknown,
		options: InvoiceServiceOptions,
	): Promise<string | Buffer> {
		const coreOptions: CoreInvoiceServiceOptions = {
			format: options.format,
			lang: options.lang,
			attachments: [],
			embedPDF: options.embedPDF,
			pdfID: options.pdfID,
			pdfDescription: options.pdfDescription,
		};

		if (options.data) {
			coreOptions.data = {
				buffer: options.data.buffer,
				filename: options.data.originalname,
				mimetype: options.data.mimetype,
			};
		}

		if (options.pdf) {
			coreOptions.pdf = {
				buffer: options.pdf.buffer,
				filename: options.pdf.originalname,
				mimetype: options.pdf.mimetype,
			};
		}

		for (const attachment of options.attachments) {
			coreOptions.attachments.push({
				file: {
					buffer: attachment.file.buffer,
					filename: attachment.file.originalname,
					mimetype: attachment.file.mimetype,
				},
			});
		}

		const coreInvoiceService = new CoreInvoiceService(this.logger);

		return coreInvoiceService.generate(input, coreOptions);
	}
}
