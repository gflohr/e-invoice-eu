import { Injectable } from '@nestjs/common';
import { ExpandObject } from 'xmlbuilder2/lib/interfaces';

import { FormatXMLService } from './format-xml.service';
import { EInvoiceFormat } from './format.e-invoice-format.interface';
import { Invoice } from '../invoice/invoice.interface';
import { Mapping } from '../mapping/mapping.interface';

@Injectable()
export class FormatUBLService
	extends FormatXMLService
	implements EInvoiceFormat
{
	get customizationID(): string {
		return 'urn:cen.eu:en16931:2017#compliant#urn:fdc:peppol.eu:2017:poacc:billing:3.0';
	}

	get profileID(): string {
		return 'urn:fdc:peppol.eu:2017:poacc:billing:01:1.0';
	}

	fillMappingDefaults(mapping: Mapping) {
		if (!('cbc:customizationID' in mapping['ubl:Invoice'])) {
			mapping['ubl:Invoice']['cbc:CustomizationID'] = this.customizationID;
		}

		if (!('cbc:profileID' in mapping['ubl:Invoice'])) {
			mapping['ubl:Invoice']['cbc:ProfileID'] = this.profileID;
		}

		// The relevant parts of the mapping and invoice structure are
		// identical.
		this.sortKeys(mapping as unknown as Invoice);
	}

	fillInvoiceDefaults(invoice: Invoice) {
		if (!('cbc:customizationID' in invoice['ubl:Invoice'])) {
			invoice['ubl:Invoice']['cbc:CustomizationID'] = this.customizationID;
		}

		if (!('cbc:profileID' in invoice['ubl:Invoice'])) {
			invoice['ubl:Invoice']['cbc:ProfileID'] = this.profileID;
		}

		this.sortKeys(invoice);
	}

	/**
	 * The order of objects is crucial for the XML generation.  We therefore
	 * have to make sure that the filled in defaults are at the right
	 * position.
	 */
	private sortKeys(invoice: Invoice) {
		const customizationID = invoice['ubl:Invoice']['cbc:CustomizationID'];
		const profileID = invoice['ubl:Invoice']['cbc:profileID'];
		const newInvoice: Invoice = {
			'ubl:Invoice': {
				'cbc:CustomizationID': customizationID,
				'cbc:ProfileID': profileID,
			},
		} as unknown as Invoice;

		for (const key of Object.keys(invoice['ubl:Invoice'])) {
			newInvoice['ubl:Invoice'][key] = invoice['ubl:Invoice'][key];
		}

		invoice['ubl:Invoice'] = newInvoice['ubl:Invoice'];
	}

	generate(invoice: Invoice): string {
		const expandObject: ExpandObject = {
			Invoice: invoice,
			'Invoice@xmlns': 'urn:oasis:names:specification:ubl:schema:xsd:Invoice-2',
			'Invoice@xmlns:cac':
				'urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2',
			'Invoice@xmlns:cbc':
				'urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2',
		};

		return this.render(expandObject, {
			prettyPrint: true,
			indent: '\t',
		});
	}
}
