import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';

import { FormatController } from './format.controller';
import { FormatFactoryService } from './format.factory.service';

describe('FormatController', () => {
	let app: INestApplication;
	let formatFactoryService: FormatFactoryService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [FormatController],
			providers: [
				{
					provide: FormatFactoryService,
					useValue: {
						listFormatServices: jest.fn(),
					},
				},
			],
		}).compile();

		app = module.createNestApplication();
		await app.init();

		formatFactoryService =
			module.get<FormatFactoryService>(FormatFactoryService);
	});

	it('should be defined', () => {
		const controller = app.get<FormatController>(FormatController);
		expect(controller).toBeDefined();
	});

	describe('GET /format/list', () => {
		it('should list all supported formats', async () => {
			const expectedFormats = [
				{
					name: 'YouBeEl',
					customizationID: 'urn.you.be.el',
					profileID: 'foobar',
					mimeType: 'application/xml',
					syntax: 'UBL',
				},
				{
					name: 'ZIRKUSFeRD',
					customizationID: 'urn.zirkus.ferd',
					profileID: 'foobar',
					mimeType: 'application/pdf',
					syntax: 'CII',
				},
			];

			jest
				.spyOn(formatFactoryService as any, 'listFormatServices')
				.mockResolvedValue(expectedFormats);

			const response = await request(app.getHttpServer())
				.get('/format/list')
				.expect(200);

			expect(response.body).toEqual(expectedFormats);
			expect(formatFactoryService.listFormatServices).toHaveBeenCalledTimes(1);
		});
	});

	afterAll(async () => {
		await app.close();
	});
});
