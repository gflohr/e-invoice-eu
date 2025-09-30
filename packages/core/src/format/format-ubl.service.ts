import { Mapping } from '@e-invoice-eu/core';
import {
	ADDITIONALSUPPORTINGDOCUMENTS,
	AttachedDocumentMimeCode,
} from '@e-invoice-eu/core/invoice/invoice.interface';

import { FormatXMLService } from './format-xml.service';
import { EInvoiceFormat } from './format.e-invoice-format.interface';
import { Invoice } from '../invoice/invoice.interface';
import { invoiceSchema } from '../invoice/invoice.schema';
import { InvoiceServiceOptions } from '../invoice/invoice.service';
import { sortBySchema } from '../utils/sort-by-schema';

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

		const orderReference = mapping['ubl:Invoice']['cac:OrderReference'];
		if (
			orderReference &&
			'cbc:SalesOrderID' in orderReference &&
			!('cbc:ID' in orderReference)
		) {
			mapping['ubl:Invoice']['cac:OrderReference']!['cbc:ID']! = 'NA';
		}
	}

	fillInvoiceDefaults(invoice: Invoice) {
		if (!('cbc:customizationID' in invoice['ubl:Invoice'])) {
			invoice['ubl:Invoice']['cbc:CustomizationID'] = this.customizationID;
		}

		if (!('cbc:profileID' in invoice['ubl:Invoice'])) {
			invoice['ubl:Invoice']['cbc:ProfileID'] = this.profileID;
		}

		const orderReference = invoice['ubl:Invoice']['cac:OrderReference'];
		if (
			orderReference &&
			'cbc:SalesOrderID' in orderReference &&
			!('cbc:ID' in orderReference)
		) {
			orderReference['cbc:ID'] = 'NA';
		}
	}

	async generate(
		invoice: Invoice,
		options: InvoiceServiceOptions,
	): Promise<string | Uint8Array> {
		await this.embedPDF(invoice, options);
		this.embedAttachments(invoice, options);

		invoice = sortBySchema(invoice, invoiceSchema);

		const cnCodes = invoiceSchema['$defs']!.codeLists['UNCL1001-cn'].enum;
		const code = invoice['ubl:Invoice']['cbc:InvoiceTypeCode'];
		if (cnCodes.includes(code) && code !== '384') {
			const creditNoteObject = {
				CreditNote: {
					'@xmlns': 'urn:oasis:names:specification:ubl:schema:xsd:CreditNote-2',
					'@xmlns:cac':
						'urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2',
					'@xmlns:cbc':
						'urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2',
					...invoice['ubl:Invoice'],
				},
			};

			(invoice as any)['ubl:CreditNote'] = invoice['ubl:Invoice'];
			delete (invoice as any)['ubl:Invoice'];

			function replaceInvoiceWithCreditNote(obj: object): object {
				// Recursively clone and transform the object
				if (Array.isArray(obj)) {
					return obj.map(replaceInvoiceWithCreditNote);
				} else if (obj !== null && typeof obj === 'object') {
					const newObj: object = {};
					for (const [key, value] of Object.entries(obj)) {
						let newKey = key;
						if (
							key.includes(':Invoice') &&
							!key.includes(':InvoicePeriod') &&
							!key.includes(':InvoiceDocumentReference')
						) {
							if (key.includes(':InvoicedQuantity')) {
								newKey = key.replace(':Invoiced', ':Credited');
							} else {
								newKey = key.replace(':Invoice', ':CreditNote');
							}
						}
						newObj[newKey] = replaceInvoiceWithCreditNote(value);
					}
					return newObj;
				}
				return obj;
			}

			return this.renderXML(replaceInvoiceWithCreditNote(creditNoteObject));
		} else {
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
	}

	private async embedPDF(invoice: Invoice, options: InvoiceServiceOptions) {
		if (!options.embedPDF) return;

		const pdf = await this.getInvoicePdf(options);
		const mimeType = 'application/pdf';
		let filename: string;
		if (options.pdf) {
			if (typeof options.pdf.filename === 'undefined') {
				throw new Error('A PDF filename is required!');
			}
			filename = options.pdf.filename;
		} else if (options.spreadsheet) {
			// Avoid using path.parse() here because it is not available in
			// the browser.
			const normalized = options.spreadsheet.filename.replace(/\\/g, '/');
			const lastSlashIndex = normalized.lastIndexOf('/');
			const lastDotIndex = normalized.lastIndexOf('.');
			const name =
				lastDotIndex > lastSlashIndex
					? normalized.substring(lastSlashIndex + 1, lastDotIndex)
					: normalized;

			filename = name + '.pdf';
		} // No else because this is already checked in getInvoicePdf().

		const ref: ADDITIONALSUPPORTINGDOCUMENTS = {
			'cbc:ID': options.pdf?.id ?? invoice['ubl:Invoice']['cbc:ID'],
			'cac:Attachment': {
				'cbc:EmbeddedDocumentBinaryObject': this.uint8ArrayToBase64(pdf),
				'cbc:EmbeddedDocumentBinaryObject@filename': filename!,
				'cbc:EmbeddedDocumentBinaryObject@mimeCode': mimeType,
			},
		};

		if (typeof options.pdf?.description !== 'undefined') {
			ref['cbc:DocumentDescription'] = options.pdf.description;
		}
		invoice['ubl:Invoice']['cac:AdditionalDocumentReference'] ??= [];
		invoice['ubl:Invoice']['cac:AdditionalDocumentReference'].push(ref);
	}

	private embedAttachments(invoice: Invoice, options: InvoiceServiceOptions) {
		const validMimeCodes: Set<AttachedDocumentMimeCode> = new Set([
			'text/csv',
			'application/pdf',
			'image/png',
			'image/jpeg',
			'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
			'application/vnd.oasis.opendocument.spreadsheet',
		]);

		for (const attachment of options.attachments || []) {
			// FIXME! Guess MIME type from filename if missing.
			const mimeType: AttachedDocumentMimeCode =
				attachment.mimetype as AttachedDocumentMimeCode;
			if (!validMimeCodes.has(mimeType)) {
				throw new Error(
					`The attachment MIME type '${mimeType}' is not allowed!`,
				);
			}
			const filename = attachment.filename;
			if (typeof filename === 'undefined') {
				throw new Error('The attachment filename is required!');
			}

			if (typeof attachment.buffer === 'undefined') {
				throw new Error('The attachment buffer is required!');
			}

			const id = attachment.id ?? filename;

			const ref: ADDITIONALSUPPORTINGDOCUMENTS = {
				'cbc:ID': id,
				'cac:Attachment': {
					'cbc:EmbeddedDocumentBinaryObject': this.uint8ArrayToBase64(
						attachment.buffer,
					),
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
