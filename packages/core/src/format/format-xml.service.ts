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
	): Promise<Buffer> {
		if (options.pdf) {
			return options.pdf.buffer;
		} else if (!options.data) {
			console.trace('here');
			throw new Error(
				'Either a data spreadsheet file or an invoice PDF is needed!',
			);
		}

		const libreoffice = options.libreOfficePath;
		if (typeof libreoffice === 'undefined') {
			throw new Error('LibreOffice path is required for conversion to PDF!');
		}

		return await renderSpreadsheet(options.data.filename, options.data.buffer, libreoffice, this.logger);
	}
}
