import { INestApplication, Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ErrorObject, ValidationError } from 'ajv/dist/2019';
import * as request from 'supertest';

import { MappingController } from './mapping.controller';
import { MappingService } from './mapping.service';
import { FormatFactoryService } from '../format/format.factory.service';
import { Invoice } from '../invoice/invoice.interface';

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
					provide: FormatFactoryService,
					useValue: {},
				},
				{
					provide: MappingService,
					useValue: {
						transform: jest.fn(),
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
		jest.clearAllMocks();
		await app.init();
	});

	afterEach(async () => {
		await app.close();
	});

	it('should return transformed data successfully', async () => {
		const mockTransformedData = {
			result: 'some transformed data',
		} as unknown as Invoice;
		jest.spyOn(service, 'transform').mockReturnValue(mockTransformedData);

		const mapping = 'test: data success';
		const data = 'test data';
		const response = await request(app.getHttpServer())
			.post('/mapping/transform/UBL')
			.attach('mapping', Buffer.from(mapping), 'mapping.yaml')
			.attach('data', Buffer.from(data), 'test.ods');

		expect(response.status).toBe(201);
		expect(response.body).toEqual(mockTransformedData);
		expect(service.transform).toHaveBeenCalledWith(
			'UBL',
			mapping,
			Buffer.from(data),
		);
	});

	it('should throw a BadRequestException if no mapping file is uploaded', async () => {
		const data = ' data';
		const response = await request(app.getHttpServer())
			.post('/mapping/transform/UBL')
			.attach('data', Buffer.from(data), 'invoice.ods');

		expect(response.status).toBe(400);
		expect(response.body.statusCode).toBe(400);
		expect(response.body.message).toBe('No mapping file uploaded');
	});

	it('should throw a BadRequestException if no invoice file is uploaded', async () => {
		const mapping = 'test: data success';
		const response = await request(app.getHttpServer())
			.post('/mapping/transform/UBL')
			.attach('mapping', Buffer.from(mapping), 'mapping.yaml');

		expect(response.status).toBe(400);
		expect(response.body.statusCode).toBe(400);
		expect(response.body.message).toBe('No invoice file uploaded');
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
			.post('/mapping/transform/UBL')
			.attach('mapping', Buffer.from('test: data fail'), 'mapping.yaml')
			.attach('data', Buffer.from('test data'), 'test.xlsx');

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
			.post('/mapping/transform/UBL')
			.attach('mapping', Buffer.from('test: data exception'), 'mapping.yaml')
			.attach('data', Buffer.from('test data'), 'test.xlsx');

		expect(response.status).toBe(500);
		expect(response.body.statusCode).toBe(500);
		expect(mockedLogger.error).toHaveBeenCalledTimes(1);
		expect(mockedLogger.error).toHaveBeenCalledWith(
			expect.stringMatching(/^unknown error: boum!/),
		);
	});
});
