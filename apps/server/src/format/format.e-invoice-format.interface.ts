import { Invoice } from '../invoice/invoice.interface';
import { InvoiceServiceOptions } from '../invoice/invoice.service';
import { Mapping } from '../mapping/mapping.interface';

export interface EInvoiceFormat {
	/**
	 * The default customization ID of that format.
	 */
	get customizationID(): string;

	/**
	 * The default profile ID of that format.
	 */
	get profileID(): string;

	/**
	 * The MIME type for that format.
	 */
	get mimeType(): string;

	/**
	 * One of 'UBL' or 'CII'.
	 */
	get syntax(): 'UBL' | 'CII';

	/**
	 * Fill default and computable values in mapping.
	 */
	fillMappingDefaults(mapping: Mapping): void;

	/**
	 * Fill default and computable values in invoice.
	 */
	fillInvoiceDefaults(invoice: Invoice): void;

	/**
	 * Generate an invoice.
	 *
	 * @param data - the prepared data structure
	 *
	 * @returns the rendered invoice
	 */
	generate(
		invoice: Invoice,
		options: InvoiceServiceOptions,
	): Promise<string | Buffer>;
}
