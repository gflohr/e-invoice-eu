import { Injectable } from '@nestjs/common';
import * as path from 'path';
import { ExpandObject } from 'xmlbuilder2/lib/interfaces';

import { FormatXMLService } from './format-xml.service';
import { EInvoiceFormat } from './format.e-invoice-format.interface';
import { Invoice } from '../invoice/invoice.interface';
import { invoiceSchema } from '../invoice/invoice.schema';
import { InvoiceServiceOptions } from '../invoice/invoice.service';
import { Mapping } from '../mapping/mapping.interface';
import { sortBySchema } from '../utils/sort-by-schema';

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
	}

	fillInvoiceDefaults(invoice: Invoice) {
		if (!('cbc:customizationID' in invoice['ubl:Invoice'])) {
			invoice['ubl:Invoice']['cbc:CustomizationID'] = this.customizationID;
		}

		if (!('cbc:profileID' in invoice['ubl:Invoice'])) {
			invoice['ubl:Invoice']['cbc:ProfileID'] = this.profileID;
		}
	}

	async generate(
		invoice: Invoice,
		options: InvoiceServiceOptions,
	): Promise<string | Buffer> {
		this.embedPDF(invoice, options);

		invoice = sortBySchema(invoice, invoiceSchema);

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

	async embedPDF(invoice: Invoice, options: InvoiceServiceOptions) {
		if (!options.embedPDF) return;

		const pdf = await this.getInvoicePdf(options);
		let filename: string;
		const mimeType = 'application/pdf';
		if (options.pdf) {
			filename = options.pdf.originalname;
		} else {
			const parsed = path.parse(
				(options.data as Express.Multer.File).originalname,
			);
			filename = parsed.name + '.pdf';
		}

		invoice['ubl:Invoice']['cac:AdditionalDocumentReference'] ??= [];
		const idx =
			invoice['ubl:Invoice']['cac:AdditionalDocumentReference'].length;
		invoice['ubl:Invoice']['cac:AdditionalDocumentReference'][idx] = {
			'cbc:ID': invoice['ubl:Invoice']['cbc:ID'],
			'cbc:DocumentTypeCode': '130',
			'cbc:DocumentDescription': 'Invoice',
			'cac:Attachment': {
				'cbc:EmbeddedDocumentBinaryObject': pdf.toString('base64'),
				'cbc:EmbeddedDocumentBinaryObject@filename': filename,
				'cbc:EmbeddedDocumentBinaryObject@mimeCode': mimeType,
			},
		};
	}
}
