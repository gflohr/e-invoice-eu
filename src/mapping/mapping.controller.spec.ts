import { Test, TestingModule } from '@nestjs/testing';
import { MappingController } from './mapping.controller';
import { MappingService } from './mapping.service';
import { INestApplication, Logger } from '@nestjs/common';
import * as request from 'supertest';
import { Invoice } from '../invoice/invoice.interface';
import { ErrorObject, ValidationError } from 'ajv/dist/2019';

describe('MappingController', () => {
	let app: INestApplication;
	let service: MappingService;

	const mockedLogger = {
		error: jest.fn(),
	};

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [MappingController],
			providers: [
				{
					provide: MappingService,
					useValue: {
						transform: jest.fn(),
						list: jest.fn(),
					},
				},
				{
					provide: Logger,
					useValue: mockedLogger,
				},
			],
		}).compile();

		service = module.get<MappingService>(MappingService);
		app = module.createNestApplication();
		await app.init();
	});

	afterEach(async () => {
		jest.clearAllMocks();
		await app.close();
	});

	it('should list all mappings', async () => {
		const ids = ['foo', 'bar', 'baz'];
		jest.spyOn(service, 'list').mockResolvedValue(ids);

		const response = await request(app.getHttpServer()).get('/mapping/list');
		expect(response.status).toBe(200);
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

	it('should return 400 if transformation fails', async () => {
		const error: ErrorObject = {
			instancePath: '/ubl:Invoice/cbc:ID',
			schemaPath: '#/properties/ubl%3AInvoice/properties/cbc%3AID',
			keyword: 'type',
			params: { type: 'string' },
			message: 'did not work',
		};
		jest.spyOn(service, 'transform').mockImplementation(() => {
			throw new ValidationError([error]);
		});

		const response = await request(app.getHttpServer())
			.post('/mapping/transform/test-id')
			.attach('file', Buffer.from('test data'), 'test.xlsx');

		expect(response.status).toBe(400);
		expect(response.body.message).toEqual('Transformation failed.');
		const details = response.body.details;
		expect(details.ajv).toBe(true);
		expect(details.validation).toBe(true);
		expect(details.errors.length).toBe(1);
		expect(details.errors[0]).toEqual(error);
	});

	it('should return 500 if an unexpected exception is thrown', async () => {
		jest.spyOn(service, 'transform').mockImplementation(() => {
			throw new Error('boum!');
		});

		const response = await request(app.getHttpServer())
			.post('/mapping/transform/test-id')
			.attach('file', Buffer.from('test data'), 'test.xlsx');

		expect(response.status).toBe(500);
		expect(response.body.statusCode).toBe(500);
		expect(mockedLogger.error).toHaveBeenCalledTimes(1);
		expect(mockedLogger.error).toHaveBeenCalledWith(
			expect.stringMatching(/^unknown error: boum!/),
		);
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
