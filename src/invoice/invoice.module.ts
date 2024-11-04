/* istanbul ignore file */
import { Logger, Module } from '@nestjs/common';

import { InvoiceController } from './invoice.controller';
import { InvoiceService } from './invoice.service';
import { FormatFactoryService } from '../format/format.factory.service';
import { FormatModule } from '../format/format.module';
import { MappingModule } from '../mapping/mapping.module';
import { MappingService } from '../mapping/mapping.service';
import { SerializerModule } from '../serializer/serializer.module';
import { SerializerService } from '../serializer/serializer.service';
import { ValidationModule } from '../validation/validation.module';
import { ValidationService } from '../validation/validation.service';

@Module({
	imports: [FormatModule, MappingModule, SerializerModule, ValidationModule],
	controllers: [InvoiceController],
	providers: [
		Logger,
		FormatFactoryService,
		InvoiceService,
		MappingService,
		SerializerService,
		ValidationService,
	],
	exports: [InvoiceService],
})
export class InvoiceModule {}
