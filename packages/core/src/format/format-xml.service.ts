import { create } from 'xmlbuilder2';

import { InvoiceServiceOptions } from '../invoice/invoice.service';
import { Logger } from '../logger.interface';
import { EInvoiceMIMEType } from './format.factory.service';
import { renderSpreadsheet } from '../utils/render-spreadsheet';

export class FormatXMLService {
	constructor(private readonly logger: Logger) {}

	get mimeType(): EInvoiceMIMEType {
		return 'application/xml';
	}

	renderXML(data: object): string {
		this.cleanAttributes(data);

		return create({ encoding: 'utf-8' }, data).end({
			prettyPrint: true,
			indent: '\t',
		});
	}

	private cleanAttributes(data: { [key: string]: any }) {
		for (const property in data) {
			const [elem, attr] = property.split('@', 2);

			if (typeof attr !== 'undefined' && elem !== '') {
				if (typeof data[elem] === 'string') {
					data[elem] = {
						'#': data[elem],
					};
				}
				data[elem][`@${attr}`] = data[property];
				delete data[property];
			}

			if (typeof data[property] === 'object') {
				this.cleanAttributes(data[property]);
			}
		}
	}

	protected async getInvoicePdf(
		options: InvoiceServiceOptions,
	): Promise<Uint8Array> {
		if (options.pdf) {
			return options.pdf.buffer;
		} else if (!options.spreadsheet) {
			throw new Error(
				'Either an invoice spreadsheet file or an invoice PDF is needed!',
			);
		}

		const libreoffice = options.libreOfficePath;
		if (typeof libreoffice === 'undefined') {
			throw new Error('LibreOffice path is required for conversion to PDF!');
		}

		return await renderSpreadsheet(
			options.spreadsheet!.filename,
			options.spreadsheet!.buffer,
			libreoffice,
			this.logger,
		);
	}

	protected uint8ArrayToBase64(uint8Array: Uint8Array) {
		let binary = '';
		const len = uint8Array.length;
		for (let i = 0; i < len; i++) {
			binary += String.fromCharCode(uint8Array[i]);
		}

		return btoa(binary);
	}
}
