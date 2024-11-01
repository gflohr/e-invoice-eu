/* istanbul ignore file */
import { Module } from '@nestjs/common';
import { MappingService } from './mapping/mapping.service';
import { MappingModule } from './mapping/mapping.module';
import { InvoiceModule } from './invoice/invoice.module';
import { ValidationModule } from './validation/validation.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggingInterceptor } from './utils/logging.interceptor';
import { SchemaModule } from './schema/schema.module';

@Module({
	imports: [MappingModule, InvoiceModule, ValidationModule, SchemaModule],
	providers: [
		MappingService,
		{
			provide: APP_INTERCEPTOR,
			useClass: LoggingInterceptor,
		},
	],
})
export class AppModule {}
