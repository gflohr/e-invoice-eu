/* istanbul ignore file */
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';

import { InvoiceModule } from './invoice/invoice.module';
import { MappingModule } from './mapping/mapping.module';
import { MappingService } from './mapping/mapping.service';
import { SchemaModule } from './schema/schema.module';
import { SerializerModule } from './serializer/serializer.module';
import { LoggingInterceptor } from './utils/logging.interceptor';
import { ValidationModule } from './validation/validation.module';
import { FormatModule } from './format/format.module';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
		}),
		MappingModule,
		InvoiceModule,
		ValidationModule,
		SchemaModule,
		SerializerModule,
		FormatModule,
	],
	providers: [
		MappingService,
		{
			provide: APP_INTERCEPTOR,
			useClass: LoggingInterceptor,
		},
	],
})
export class AppModule {}
