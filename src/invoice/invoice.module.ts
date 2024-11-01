/* istanbul ignore file */
import { Module } from '@nestjs/common';

import { InvoiceService } from './invoice.service';

@Module({
	providers: [InvoiceService],
	controllers: [],
})
export class InvoiceModule {}
