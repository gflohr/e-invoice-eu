import { Injectable, NotFoundException } from '@nestjs/common';

import { FormatUBLService } from './format-ubl.service';
import { FormatXMLService } from './format-xml.service';
import { EInvoiceFormat } from './format.e-invoice-format.interface';
import { SerializerService } from '../serializer/serializer.service';

@Injectable()
export class FormatFactoryService {
	private readonly formatServices: { [key: string]: new (...args: any[]) => EInvoiceFormat } = {
		UBL: FormatUBLService,
	};

	constructor(
		private readonly serializerService: SerializerService,
	) {}

	createFormatService(format: string): EInvoiceFormat {
		const FormatService = this.formatServices[format];

		if (!FormatService) {
			throw new NotFoundException(`Format '${format}' not supported.`);
		}

		if (FormatXMLService.isPrototypeOf(FormatService)) {
			return new FormatService(this.serializerService);
		} else {
			return new FormatService();
		}
	}
}
