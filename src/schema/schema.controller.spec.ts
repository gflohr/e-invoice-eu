import { Test, TestingModule } from '@nestjs/testing';
import { SchemaController } from './schema.controller';
import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { mappingSchema } from '../mapping/mapping.schema';
import { invoiceSchema } from '../invoice/invoice.schema';

describe('SchemaController', () => {
	let app: INestApplication;
	let controller: SchemaController;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [SchemaController],
		}).compile();

		controller = module.get<SchemaController>(SchemaController);
		app = module.createNestApplication();
		await app.init();
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});

	it('should return the mapping schema', async () => {
		const response = await request(app.getHttpServer()).get('/schema/mapping');

		expect(response.status).toBe(200);
		expect(response.body).toEqual(mappingSchema);
	});

	it('should return the invoice schema', async () => {
		const response = await request(app.getHttpServer()).get('/schema/invoice');

		expect(response.status).toBe(200);
		expect(response.body).toEqual(invoiceSchema);
	});
});
