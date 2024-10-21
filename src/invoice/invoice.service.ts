import { Injectable } from '@nestjs/common';
import { GenerateInvoiceDto } from './dto/generate-invoice.dto';

@Injectable()
export class InvoiceService {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	generate(invoice: GenerateInvoiceDto): string {
		return '<Invoice/>';
	}
}
