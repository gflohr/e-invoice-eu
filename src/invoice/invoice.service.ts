import { Injectable } from '@nestjs/common';
import Ajv2019, { ValidateFunction } from 'ajv/dist/2019';

import { Invoice } from './invoice.interface';
import { invoiceSchema } from './invoice.schema';
import { FormatFactoryService } from '../format/format.factory.service';
import { ValidationService } from '../validation/validation.service';

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
	private readonly validator: ValidateFunction<Invoice>;

	constructor(
		private readonly formatFactoryService: FormatFactoryService,
		private readonly validationService: ValidationService,
	) {
		const ajv = new Ajv2019({
			strict: true,
			allErrors: true,
			useDefaults: true,
		});
		this.validator = ajv.compile(invoiceSchema);
	}

	async generate(
		input: unknown,
		options: InvoiceServiceOptions,
	): Promise<string | Buffer> {
		const formatter = this.formatFactoryService.createFormatService(
			options.format,
		);

		const invoice = this.validationService.validate(
			'invoice data',
			this.validator,
			input,
		);

		return formatter.generate(invoice, options);
	}
}
