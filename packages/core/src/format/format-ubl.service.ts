import { Mapping } from '@e-invoice-eu/core';
import {
	ADDITIONALSUPPORTINGDOCUMENTS,
	AttachedDocumentMimeCode,
} from '@e-invoice-eu/core/invoice/invoice.interface';
import { Injectable } from '@nestjs/common';
import * as path from 'path';

import { FormatXMLService } from './format-xml.service';
import { EInvoiceFormat } from './format.e-invoice-format.interface';
import { Invoice } from '../invoice/invoice.interface';
import { invoiceSchema } from '../invoice/invoice.schema';
import { InvoiceServiceOptions } from '../invoice/invoice.service';
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
		if (!('cbc:CustomizationID' in mapping['ubl:Invoice'])) {
			mapping['ubl:Invoice']['cbc:CustomizationID'] = this.customizationID;
		}

		if (!('cbc:ProfileID' in mapping['ubl:Invoice'])) {
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
		await this.embedPDF(invoice, options);
		this.embedAttachments(invoice, options);

		invoice = sortBySchema(invoice, invoiceSchema);

		const invoiceObject = {
			Invoice: {
				'@xmlns': 'urn:oasis:names:specification:ubl:schema:xsd:Invoice-2',
				'@xmlns:cac':
					'urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2',
				'@xmlns:cbc':
					'urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2',
				...invoice['ubl:Invoice'],
			},
		};

		return this.renderXML(invoiceObject);
	}

	async embedPDF(invoice: Invoice, options: InvoiceServiceOptions) {
		if (typeof options.embedPDF === 'undefined') return;

		const pdf = await this.getInvoicePdf(options);
		const mimeType = 'application/pdf';
		let filename: string;
		if (options.pdf) {
			if (typeof options.pdf.filename === 'undefined') {
				throw new Error('A PDF filename is required!');
			}
			filename = options.pdf.filename;
		} else if (options.data) {
			const parsed = path.parse(options.data.filename);
			filename = parsed.name + '.pdf';
		} else {
			throw new Error(
				'Either a data spreadsheet file or an invoice PDF' +
					' is needed, when a PDF should be embedded!',
			);
		}

		const ref: ADDITIONALSUPPORTINGDOCUMENTS = {
			'cbc:ID': options.pdfID ?? invoice['ubl:Invoice']['cbc:ID'],
			'cac:Attachment': {
				'cbc:EmbeddedDocumentBinaryObject': pdf.toString('base64'),
				'cbc:EmbeddedDocumentBinaryObject@filename': filename,
				'cbc:EmbeddedDocumentBinaryObject@mimeCode': mimeType,
			},
		};

		if (typeof options.pdfDescription !== 'undefined') {
			ref['cbc:DocumentDescription'] = options.pdfDescription;
		}
		invoice['ubl:Invoice']['cac:AdditionalDocumentReference'] ??= [];
		invoice['ubl:Invoice']['cac:AdditionalDocumentReference'].push(ref);
	}

	embedAttachments(invoice: Invoice, options: InvoiceServiceOptions) {
		const validMimeCodes: Set<AttachedDocumentMimeCode> = new Set([
			'text/csv',
			'application/pdf',
			'image/png',
			'image/jpeg',
			'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
			'application/vnd.oasis.opendocument.spreadsheet',
		]);

		for (const attachment of options.attachments) {
			const mimeType: AttachedDocumentMimeCode = attachment.file
				.mimetype as AttachedDocumentMimeCode;
			if (!validMimeCodes.has(mimeType)) {
				throw new Error(
					`The attachment MIME type '${mimeType}' is not allowed!`,
				);
			}
			const filename = attachment.file.filename;
			const id = attachment.id ?? filename;

			const ref: ADDITIONALSUPPORTINGDOCUMENTS = {
				'cbc:ID': id,
				'cac:Attachment': {
					'cbc:EmbeddedDocumentBinaryObject':
						attachment.file.buffer.toString('base64'),
					'cbc:EmbeddedDocumentBinaryObject@filename': filename,
					'cbc:EmbeddedDocumentBinaryObject@mimeCode': mimeType,
				},
			};

			if (typeof attachment.description !== 'undefined') {
				ref['cbc:DocumentDescription'] = attachment.description;
			}
			invoice['ubl:Invoice']['cac:AdditionalDocumentReference'] ??= [];
			invoice['ubl:Invoice']['cac:AdditionalDocumentReference'].push(ref);
		}
	}
}
