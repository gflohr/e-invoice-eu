/* istanbul ignore file */
import { Module } from '@nestjs/common';

import { InvoiceController } from './invoice.controller';
import { InvoiceService } from './invoice.service';

@Module({
	providers: [InvoiceService],
	controllers: [InvoiceController],
})
export class InvoiceModule {}
