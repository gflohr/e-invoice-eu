import Ajv2019, { ValidateFunction } from 'ajv/dist/2019';

import { Invoice } from './invoice.interface';
import { invoiceSchema } from './invoice.schema';
import { FormatFactoryService } from '../format/format.factory.service';
import { ILogger } from '../ilogger';
import { ValidationService } from '../validation';

/**
 * A container for a file used for an e-invoice.
 */
export type InvoiceFile = {
	/**
	 * The data of the file.
	 */
	buffer: Buffer;

	/**
	 * The filename.
	 */
	filename: string;

	/**
	 * The MIME type of the file.
	 */
	mimetype: string;
};

export type InvoiceAttachment = {
	/**
	 * The uploaded file.
	 */
	file: InvoiceFile;

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
	data?: InvoiceFile;

	/**
	 * A PDF version of the invoice.  For Factur-X, either `data` or `pdf`
	 * must be present.
	 */
	pdf?: InvoiceFile;

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

	/**
	 * Path to LibreOffice executable.
	 */
	libreOfficePath?: string;
};

export class InvoiceService {
	private readonly formatFactoryService: FormatFactoryService;
	private readonly validator: ValidateFunction<Invoice>;
	private readonly validationService: ValidationService;

	constructor(
		private readonly logger: ILogger,
	) {
		this.formatFactoryService = new FormatFactoryService();
		const ajv = new Ajv2019({
			strict: true,
			allErrors: true,
			useDefaults: true,
		});
		this.validator = ajv.compile(invoiceSchema);
		this.validationService = new ValidationService(this.logger);
	}

	async generate(
		input: unknown,
		options: InvoiceServiceOptions,
	): Promise<string | Buffer> {
		const invoice = this.validationService.validate(
			'invoice data',
			this.validator,
			input,
		);

		const formatter = this.formatFactoryService.createFormatService(
			options.format,
		);

		if (typeof formatter === 'undefined') {
			throw new Error(`Unsupported format: ${options.format}`);
		}

		return formatter.generate(invoice, options);
	}
}
