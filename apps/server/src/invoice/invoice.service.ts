import {
	InvoiceService as CoreInvoiceService,
	InvoiceServiceOptions as CoreInvoiceServiceOptions,
	Invoice,
} from '@e-invoice-eu/core';
import { Injectable, Logger } from '@nestjs/common';

import { AppConfigService } from '../app-config/app-config.service';

export type InvoiceAttachment = {
	/** The uploaded file. */
	file: Express.Multer.File;

	/** An optional ID. */
	id?: string;

	/** An optional description. */
	description?: string;
};

type InvoiceServiceOptions = {
	/** The invoice format like `XRECHNUNG-UBL` or `Factur-X-Extended`. */
	format: string;

	/** The spreadsheet data. */
	spreadsheet?: Express.Multer.File;

	/**
	 * A PDF version of the invoice. For Factur-X, either `data` or `pdf` must be
	 * present.
	 */
	pdf?: Express.Multer.File;

	/** A language identifier like "fr-ca". */
	lang: string;

	/** An array of supplementary attachments. */
	attachments: InvoiceAttachment[];

	/** Set to invoice description if invoice should be embedded. */
	embedPDF?: boolean;

	/** ID for an embedded PDF, defaults to the document id. */
	pdfID?: string;

	/** Description for the embedded PDF. */
	pdfDescription?: string;
};

@Injectable()
export class InvoiceService {
	private readonly logger = new Logger(InvoiceService.name);

	constructor(private readonly appConfigService: AppConfigService) {}

	async generate(
		input: Invoice,
		options: InvoiceServiceOptions,
	): Promise<string | Uint8Array> {
		const coreOptions: CoreInvoiceServiceOptions = {
			format: options.format,
			lang: options.lang,
			attachments: [],
			embedPDF: options.embedPDF,
		};

		if (options.spreadsheet) {
			coreOptions.spreadsheet = {
				buffer: options.spreadsheet.buffer,
				filename: options.spreadsheet.originalname,
				mimetype: options.spreadsheet.mimetype,
			};
		}

		if (options.pdf) {
			coreOptions.pdf = {
				buffer: options.pdf.buffer,
				filename: options.pdf.originalname,
				mimetype: options.pdf.mimetype,
				id: options.pdfID,
				description: options.pdfDescription,
			};
		}

		for (const attachment of options.attachments) {
			coreOptions.attachments!.push({
				buffer: attachment.file.buffer,
				filename: attachment.file.originalname,
				mimetype: attachment.file.mimetype,
				id: attachment.id,
				description: attachment.description,
			});
		}

		coreOptions.libreOfficePath =
			this.appConfigService.get('programs').libreOffice;

		const coreInvoiceService = new CoreInvoiceService(this.logger);

		return coreInvoiceService.generate(input, coreOptions);
	}
}
