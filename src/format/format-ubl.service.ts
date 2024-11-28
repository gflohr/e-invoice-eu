import { Injectable } from '@nestjs/common';
import { ExpandObject } from 'xmlbuilder2/lib/interfaces';

import { FormatXMLService } from './format-xml.service';
import { EInvoiceFormat } from './format.e-invoice-format.interface';
import { Invoice } from '../invoice/invoice.interface';
import { InvoiceServiceOptions } from '../invoice/invoice.service';
import { Mapping } from '../mapping/mapping.interface';

@Injectable()
export class FormatUBLService
	extends FormatXMLService
	implements EInvoiceFormat
{
	get customizationID(): string {
		return 'urn:cen.eu:en16931:2017';
	}

	get profileID(): string {
		return 'urn:fdc:peppol.eu:2017:poacc:billing:01:1.0';
	}

	get syntax(): 'UBL' | 'CII' {
		return 'UBL';
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
	private sortKeys(invoice: { [key: string]: any }) {
		const customizationID = invoice['ubl:Invoice']['cbc:CustomizationID'];
		const profileID = invoice['ubl:Invoice']['cbc:ProfileID'];
		const newInvoice: { [key: string]: any } = {
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

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	async generate(invoice: Invoice, _options: InvoiceServiceOptions): Promise<string | Buffer> {
		const expandObject: ExpandObject = {
			Invoice: invoice['ubl:Invoice'],
			'Invoice@xmlns': 'urn:oasis:names:specification:ubl:schema:xsd:Invoice-2',
			'Invoice@xmlns:cac':
				'urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2',
			'Invoice@xmlns:cbc':
				'urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2',
		};

		return this.renderXML(expandObject, {
			prettyPrint: true,
			indent: '\t',
		});
	}
}
