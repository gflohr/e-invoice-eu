import { Invoice } from '../invoice/invoice.interface';
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
	generate(invoice: Invoice): string;
}
