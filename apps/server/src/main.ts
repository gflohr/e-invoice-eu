/* istanbul ignore file */
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

import { AppModule } from './app.module';

async function bootstrap() {
	const logger = new Logger('Bootstrap');
	const app = await NestFactory.create(AppModule);
	app.setGlobalPrefix('api');

	const config = new DocumentBuilder()
		.setTitle('EInvoice EU API')
		.setDescription('Generate electronic invoices conforming to EN16931')
		.build();

	const document = SwaggerModule.createDocument(app, config);
	SwaggerModule.setup('api', app, document);

	const configService = app.get(ConfigService);
	const port = configService.get<number>('PORT') || 3000;

	await app.listen(port);

	logger.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
