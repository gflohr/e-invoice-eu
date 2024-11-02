/* istanbul ignore file */
import { Logger, Module } from '@nestjs/common';

import { InvoiceController } from './invoice.controller';
import { InvoiceService } from './invoice.service';
import { MappingModule } from '../mapping/mapping.module';
import { MappingService } from '../mapping/mapping.service';
import { SerializerModule } from '../serializer/serializer.module';
import { SerializerService } from '../serializer/serializer.service';
import { ValidationModule } from '../validation/validation.module';
import { ValidationService } from '../validation/validation.service';

@Module({
	imports: [MappingModule, SerializerModule, ValidationModule],
	controllers: [InvoiceController],
	providers: [
		Logger,
		InvoiceService,
		MappingService,
		SerializerService,
		ValidationService,
	],
	exports: [InvoiceService],
})
export class InvoiceModule {}
