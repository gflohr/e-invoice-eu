import { Injectable } from '@nestjs/common';

import { Invoice } from './invoice.interface';

@Injectable()
export class InvoiceService {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	generate(invoice: Invoice): string {
		return '<Invoice/>';
	}
}
