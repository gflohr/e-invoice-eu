import Ajv2019 from 'ajv/dist/2019';

import { Invoice } from './invoice.interface';
import { invoiceSchema } from './invoice.schema';
import { FormatFactoryService } from '../format/format.factory.service';
import { Logger } from '../logger.interface';
import { ValidationService } from '../validation';
import { ExpandObject } from 'xmlbuilder2/lib/interfaces';

/**
 * A container for a file used for an e-invoice.
 */
export type FileInfo = {
	/**
	 * The data of the file.
	 */
	buffer: Uint8Array;

	/**
	 * The filename.
	 */
	filename: string;

	/**
	 * The MIME type of the file.
	 */
	mimetype: string;

	/**
	 * An optional ID.
	 */
	id?: string;

	/**
	 * An optional description.
	 */
	description?: string;
};

/**
 * Invoice creation options.
 */
export type InvoiceServiceOptions = {
	/**
	 * The invoice format like `XRECHNUNG-UBL` or `Factur-X-Extended`.
	 */
	format: string;

	/**
	 * The spreadsheet data.
	 */
	spreadsheet?: FileInfo;

	/**
	 * A PDF version of the invoice.  For Factur-X, either `data` or `pdf`
	 * must be present.
	 */
	pdf?: FileInfo;

	/**
	 * A language identifier like "fr-ca".
	 */
	lang: string;

	/**
	 * An array of supplementary attachments.
	 */
	attachments?: FileInfo[];

	/**
	 * Set to invoice description if invoice should be embedded.
	 */
	embedPDF?: boolean;

	/**
	 * Path to LibreOffice executable.
	 */
	libreOfficePath?: string;

	/**
	 * Shut up warnings.
	 */
	noWarnings?: boolean;

	/**
	 * Callback function invoked before the XML is rendered. This
	 * allows fine-tuning the output XML, for example by adding currently
	 * unsupported CII elements. Another use case is applying fixes for open
	 * bugs.
	 *
	 * The `data` argument is a plain JavaScript object where all nodes
	 * are either an `Array` or another object, and all leaves are
	 * strings. The type `ExpandObject` is defined in `xmlbuilder2`.
	 *
	 * UBL example:
	 *
	 * ```typescript
	 * const defaultNotes = [
	 *	'We only use organic ingredients (no GMO)!',
	 *	'We work exclusively with regional suppliers.',
	 * ];
	 *
	 * invoiceServiceOptions.postProcessor = async (data: ExpandObject) => {
	 *	const document = data['Invoice'] ?? data['CreditNote'];
	 *	const notes = document['cbc:Note'];
	 *
	 *	if (notes) {
	 *		notes.push(...defaultNotes);
	 *	} else {
	 *		document['cbc:Note'] = [...defaultNotes];
	 *	}
	 * ```
	 *
	 * CII example:
	 *
	 * ```typescript
	 * const defaultNotes = [
	 *	'We only use organic ingredients (no GMO)!',
	 *	'We work exclusively with regional suppliers.',
	 * ];
	 *
	 * const postProcessor = async (data: ExpandObject) => {
	 * 	if (
	 * 		data['rsm:CrossIndustryInvoice']['rsm:ExchangedDocument']![
	 * 			'ram:IncludedNote'
	 * 		]
	 * 	) {
	 * 		if (
	 * 			!Array.isArray(
	 * 				data['rsm:CrossIndustryInvoice']['rsm:ExchangedDocument']![
	 * 					'ram:IncludedNote'
	 * 				],
	 * 			)
	 * 		) {
	 * 			data['rsm:CrossIndustryInvoice']['rsm:ExchangedDocument']![
	 * 				'ram:IncludedNote'
	 * 			] = [
	 * 				data['rsm:CrossIndustryInvoice']['rsm:ExchangedDocument']![
	 * 					'ram:IncludedNote'
	 * 				],
	 * 			];
	 * 		}
	 * 	} else {
	 * 		data['rsm:CrossIndustryInvoice']['rsm:ExchangedDocument']![
	 * 			'ram:IncludedNote'
	 * 		] = [];
	 * 	}
	 * 	const notes =
	 * 		data['rsm:CrossIndustryInvoice']['rsm:ExchangedDocument'][
	 * 			'ram:IncludedNote'
	 * 		]; *
	 * 	for (const note of defaultNotes) {
	 * 		notes.push({ 'ram:Content': note });
	 * 	}
	 * };
	 * ```
	 */
	postProcessor?: (data: ExpandObject) => Promise<void>;
};

/**
 * Render an e-invoice from either an {@link Invoice} object or a spreadsheet
 * and a {@link Mapping}.
 */
export class InvoiceService {
	private readonly formatFactoryService: FormatFactoryService;
	private readonly validationService: ValidationService;

	/**
	 * Creates a new instance of the service.
	 *
	 * @param logger - The logger instance used for logging messages, warnings and errors.
	 */
	constructor(private readonly logger: Logger) {
		this.formatFactoryService = new FormatFactoryService();
		this.validationService = new ValidationService(this.logger);
	}

	/**
	 * Generate an e-invoice. The input gets validated against the
	 * {@link invoiceSchema} JSON schema, to make sure that it properly
	 * fulfills the {@link Invoice} interface.
	 *
	 * If the specific format is an XML format (has the MIME type
	 * `"application/xml"`), it gets returned as a `string`. In case of a
	 * PDF format (MIME type `"application/pdf"`), a `Uint8Array` is returned.
	 *
	 * @param input the input data
	 * @param options modify various aspects of the invoice.
	 * @returns the rendered invoice
	 */
	async generate(
		input: Invoice,
		options: InvoiceServiceOptions,
	): Promise<string | Uint8Array> {
		const patched = structuredClone(input);
		if (
			input['ubl:Invoice'] &&
			input['ubl:Invoice']['cbc:Note'] &&
			typeof input['ubl:Invoice']['cbc:Note'] === 'string'
		) {
			patched['ubl:Invoice']['cbc:Note'] = [input['ubl:Invoice']['cbc:Note']];
			this.deprecationWarning(options);
		}

		const formatter = this.formatFactoryService.createFormatService(
			options.format,
			this.logger,
		);

		options.format = this.formatFactoryService.normalizeFormat(options.format);

		const ajv = new Ajv2019({
			strict: true,
			allErrors: true,
			useDefaults: true,
		});

		const schema = structuredClone(invoiceSchema);
		formatter.patchSchema(schema);
		const validator = ajv.compile(schema);
		const invoice = this.validationService.validate(
			'invoice data',
			validator,
			patched,
		);

		formatter.fillInvoiceDefaults(invoice);

		return formatter.generate(invoice, options);
	}

	private deprecationWarning(options: InvoiceServiceOptions) {
		if (!options.noWarnings) {
			console.warn("Coercing 'ubl:Invoice->cbc:Note' from an array into an");
			console.warn('array of strings. Please change your data resp. mapping!');
			console.warn('The automatic coercion will be removed in version 4!');
		}
	}
}
