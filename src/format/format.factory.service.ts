import { Injectable, NotFoundException } from '@nestjs/common';

import { FormatUBLService } from './format-ubl.service';
import { FormatXRECHNUNGUBLService } from './format-xrechnung-ubl.service';
import { EInvoiceFormat } from './format.e-invoice-format.interface';
import { SerializerService } from '../serializer/serializer.service';

@Injectable()
export class FormatFactoryService {
	private readonly formatServices: {
		[key: string]: new (...args: any[]) => EInvoiceFormat;
	} = {
		UBL: FormatUBLService,
		'XRECHNUNG-UBL': FormatXRECHNUNGUBLService,
	};

	constructor(private readonly serializerService: SerializerService) {}

	createFormatService(format: string): EInvoiceFormat {
		const FormatService = this.formatServices[format];

		if (!FormatService) {
			throw new NotFoundException(`Format '${format}' not supported.`);
		}

		return new FormatService(this.serializerService);
	}
}
