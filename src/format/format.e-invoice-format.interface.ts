import { Invoice } from "../invoice/invoice.interface";

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
	 * Generate an invoice.
	 *
	 * @param data - the prepared data structure
	 *
	 * @returns the rendered invoice
	 */
	generate(invoice: Invoice): string;
}
