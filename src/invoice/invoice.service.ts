import { Injectable } from '@nestjs/common';

import { Invoice } from './invoice.interface';
import { FormatFactoryService } from '../format/format.factory.service';

@Injectable()
export class InvoiceService {
	constructor(private readonly formatFactoryService: FormatFactoryService) {}

	generate(format: string, invoice: Invoice): string {
		const formatter = this.formatFactoryService.createFormatService(format);
		const xml = formatter.generate(invoice);

		return xml;
	}
}
