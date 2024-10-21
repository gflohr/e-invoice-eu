import { Test, TestingModule } from '@nestjs/testing';
import { MappingController } from './mapping.controller';
import { MappingService } from './mapping.service';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Invoice } from '../invoice/invoice.interface';

describe('MappingController', () => {
	let app: INestApplication;
	let service: MappingService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [MappingController],
			providers: [
				{
					provide: MappingService,
					useValue: {
						transform: jest.fn(),
					},
				},
			],
		}).compile();

		service = module.get<MappingService>(MappingService);
		app = module.createNestApplication();
		await app.init();
	});

	afterEach(async () => {
		await app.close();
	});

	it('should return transformed data successfully', async () => {
		const mockTransformedData = {
			result: 'some transformed data',
		} as unknown as Invoice;
		jest.spyOn(service, 'transform').mockResolvedValue(mockTransformedData);

		const response = await request(app.getHttpServer())
			.post('/mapping/transform/default-invoice')
			.attach('file', Buffer.from('test data'), 'test.ods');

		expect(response.status).toBe(201);
		expect(response.body).toEqual(mockTransformedData);
		expect(service.transform).toHaveBeenCalledWith(
			'default-invoice',
			expect.anything(),
		);
	});

	it.skip('should return 400 if transformation fails', async () => {
		jest
			.spyOn(service, 'transform')
			.mockRejectedValue(new Error('Transformation error'));

		const response = await request(app.getHttpServer())
			.post('/mapping/transform/test-id')
			.attach('file', Buffer.from('test data'), 'test.xlsx');

		expect(response.status).toBe(400);
		expect(response.body).toEqual({
			message: 'Transformation failed.',
			details: {},
		});
	});

	it('should return 404 if mapping is not found', async () => {
		const error = new Error();
		(error as any).code = 'ENOENT';
		jest.spyOn(service, 'transform').mockRejectedValue(error);

		const response = await request(app.getHttpServer())
			.post('/mapping/transform/not-there')
			.attach('file', Buffer.from('test data'), 'test.xlsx');

		expect(response.status).toBe(404);
		expect(response.body).toEqual({
			message: 'Not Found',
			statusCode: 404,
		});
	});
});
