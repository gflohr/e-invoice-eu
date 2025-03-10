/* istanbul ignore file */
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import * as v from 'valibot';

import { AppConfigModule } from './app-config/app-config.module';
import { appConfigSchema } from './app-config/app-config.schema';
import { AppConfigService } from './app-config/app-config.service';
import { FormatFactoryService } from './format/format.factory.service';
import { FormatModule } from './format/format.module';
import { InvoiceModule } from './invoice/invoice.module';
import { MappingModule } from './mapping/mapping.module';
import { MappingService } from './mapping/mapping.service';
import { SchemaModule } from './schema/schema.module';
import { LoggingInterceptor } from './utils/logging.interceptor';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			validate: env => {
				return v.parse(appConfigSchema, AppConfigService.loadConfig(env));
			},
		}),
		FormatModule,
		InvoiceModule,
		MappingModule,
		SchemaModule,
		AppConfigModule,
	],
	providers: [
		MappingService,
		FormatFactoryService,
		{
			provide: APP_INTERCEPTOR,
			useClass: LoggingInterceptor,
		},
	],
})
export class AppModule {}
