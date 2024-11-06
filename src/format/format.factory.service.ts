import { Injectable, NotFoundException } from '@nestjs/common';

import { FormatUBLService } from './format-ubl.service';
import { FormatXRECHNUNGUBLService } from './format-xrechnung-ubl.service';
import { EInvoiceFormat } from './format.e-invoice-format.interface';
import { SerializerService } from '../serializer/serializer.service';

export class FormatInfo {
	name: string;
	customizationID: string;
	profileID: string;
	mimeType: string;
	syntax: 'UBL' | 'CII';
}

@Injectable()
export class FormatFactoryService {
	private readonly formatServices: {
		[key: string]: new (...args: any[]) => EInvoiceFormat;
	} = {
		UBL: FormatUBLService,
		'XRECHNUNG-UBL': FormatXRECHNUNGUBLService,
	};

	constructor(private readonly serializerService: SerializerService) {}

	listFormatServices(): FormatInfo[] {
		const infos: FormatInfo[] = [];

		for (const format in this.formatServices) {
			const FormatService = this.formatServices[format];

			const service = new FormatService(this.serializerService);
			infos.push({
				name: format,
				customizationID: service.customizationID,
				profileID: service.profileID,
				mimeType: service.mimeType,
				syntax: service.syntax,
			});
		}

		return infos;
	}

	createFormatService(format: string): EInvoiceFormat {
		const FormatService = this.formatServices[format];

		if (!FormatService) {
			throw new NotFoundException(`Format '${format}' not supported.`);
		}

		return new FormatService(this.serializerService);
	}
}
