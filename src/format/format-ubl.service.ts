import { Injectable } from '@nestjs/common';
import { ExpandObject } from 'xmlbuilder2/lib/interfaces';

import { FormatXMLService } from './format-xml.service';
import { EInvoiceFormat } from './format.e-invoice-format.interface';
import { Invoice } from '../invoice/invoice.interface';

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

	generate(invoice: Invoice): string {
		const expandObject: ExpandObject = {
				Invoice: invoice,
				'Invoice@xmlns':
					'urn:oasis:names:specification:ubl:schema:xsd:Invoice-2',
				'Invoice@xmlns:cac':
					'urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2',
				'Invoice@xmlns:cbc':
					'urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2',
		};

		return this.render(expandObject,
			{
				prettyPrint: true,
				indent: '\t',
			}
		);
	}
}
