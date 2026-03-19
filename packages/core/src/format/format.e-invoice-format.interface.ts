import { JSONSchemaType } from 'ajv';

import { EInvoiceMIMEType } from './format.factory.service';
import { Invoice } from '../invoice/invoice.interface';
import { InvoiceServiceOptions } from '../invoice/invoice.service';
import { Mapping } from '../mapping/mapping.interface';

/**
 * Interface representing an e-invoice format generation service.
 */
export interface EInvoiceFormat {
	/**
	 * The default customization ID of the format.
	 *
	 * This ID specifies a particular customization of the invoice format,
	 * which may define additional constraints or extensions to the standard.
	 */
	get customizationID(): string;

	/**
	 * The default profile ID of the format.
	 *
	 * The profile ID identifies a specific usage profile for the e-invoice,
	 * often used to distinguish between different industry-specific implementations.
	 */
	get profileID(): string;

	/**
	 * The MIME type associated with this invoice format.
	 *
	 * This indicates the expected media type when generating or processing
	 * invoices in this format.
	 */
	get mimeType(): EInvoiceMIMEType;

	/**
	 * The syntax used for this e-invoice format.
	 *
	 * This is either 'UBL' (Universal Business Language) or 'CII' (Cross Industry Invoice),
	 * which are both common standards for electronic invoicing.
	 */
	get syntax(): 'UBL' | 'CII';

	/**
	 * Populates a mapping with default and computable values.
	 *
	 * This method ensures that all required fields in the mapping
	 * have reasonable defaults before further processing.
	 *
	 * @param mapping - The mapping definition to be updated.
	 */
	fillMappingDefaults(mapping: Mapping): void;

	/**
	 * Populates an invoice with default and computable values.
	 *
	 * This method fills in any missing fields in the invoice with default values
	 * to ensure it meets the required specifications.
	 *
	 * @param invoice - The invoice to be updated.
	 */
	fillInvoiceDefaults(invoice: Invoice): void;

	/**
	 * Generates an invoice in the specified format.
	 *
	 * This function converts the given invoice data into a serialized format
	 * (such as XML or JSON) that conforms to the selected e-invoice standard.
	 *
	 * @param invoice - The invoice data structure containing all required information.
	 * @param options - Additional options influencing invoice generation.
	 *
	 * @returns A promise resolving to the generated invoice as a string or a Uint8Array,
	 *          depending on the format.
	 */
	generate(
		invoice: Invoice,
		options: InvoiceServiceOptions,
	): Promise<string | Uint8Array>;

	/**
	 * Apply necessary patches to the invoice schema.
	 *
	 * @param schema - the original schema
	 */
	patchSchema(schema: JSONSchemaType<Invoice>);
}
