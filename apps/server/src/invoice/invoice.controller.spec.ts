import {
	INestApplication,
	InternalServerErrorException,
	Logger,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ErrorObject, ValidationError } from 'ajv/dist/2019';
import { Response } from 'express';
import * as request from 'supertest';

import { InvoiceController } from './invoice.controller';
import { Invoice } from './invoice.interface';
import { InvoiceService } from './invoice.service';
import { FormatFactoryService } from '../format/format.factory.service';
import { MappingService } from '../mapping/mapping.service';
import { ValidationService } from '../validation/validation.service';

describe('InvoiceController', () => {
	let app: INestApplication;
	let controller: InvoiceController;
	let invoiceService: InvoiceService;
	let mappingService: MappingService;

	const mockedLogger = {
		error: jest.fn(),
		warn: jest.fn(),
	};

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [InvoiceController],
			providers: [
				InvoiceService,
				MappingService,
				{ provide: FormatFactoryService, useValue: {} },
				{ provide: ValidationService, useValue: {} },
				{ provide: Logger, useValue: mockedLogger },
			],
		}).compile();

		controller = module.get<InvoiceController>(InvoiceController);
		invoiceService = module.get<InvoiceService>(InvoiceService);
		mappingService = module.get<MappingService>(MappingService);

		app = module.createNestApplication();
		jest.clearAllMocks();
		await app.init();
	});

	afterEach(async () => {
		await app.close();
	});

	describe('create', () => {
		it('should successfully create an invoice from JSON', async () => {
			const mockXml = '<Invoice/>';
			jest.spyOn(invoiceService, 'generate').mockResolvedValue(mockXml);

			const invoice: Express.Multer.File = {
				buffer: Buffer.from('{}'),
				encoding: '7bit',
				fieldname: 'data',
				mimetype: 'application/json',
				originalname: 'invoice.json',
				size: 2,
			} as Express.Multer.File;
			const response = await request(app.getHttpServer())
				.post('/invoice/create/UBL')
				.attach('invoice', invoice.buffer, 'invoice.json');

			expect(response.status).toBe(201);
			expect(response.text).toEqual(mockXml);

			expect(invoiceService.generate).toHaveBeenCalledWith(
				{},
				{
					format: 'ubl',
					lang: 'en',
					pdf: undefined,
					pdfDescription: undefined,
					pdfID: undefined,
					attachments: [],
				},
			);
		});
	});

	describe('create and transform', () => {
		it('should successfully transform and create an invoice', async () => {
			const mockTransformedData = {
				result: 'some transformed data',
			} as unknown as Invoice;
			jest
				.spyOn(mappingService, 'transform')
				.mockReturnValue(mockTransformedData);
			const mockXml = '<Invoice/>';
			jest.spyOn(invoiceService, 'generate').mockResolvedValue(mockXml);

			const mapping = 'test: data success';
			const data: Express.Multer.File = {
				buffer: Buffer.from('test data'),
				encoding: '7bit',
				fieldname: 'data',
				mimetype: 'application/vnd.oasis.opendocument.spreadsheet',
				originalname: 'invoice.ods',
				size: 9,
			} as Express.Multer.File;
			const response = await request(app.getHttpServer())
				.post('/invoice/create/UBL')
				.attach('mapping', Buffer.from(mapping), 'mapping.yaml')
				.attach('data', data.buffer, 'invoice.ods');

			expect(response.status).toBe(201);
			expect(response.text).toEqual(mockXml);
			expect(mappingService.transform).toHaveBeenCalledWith(
				'ubl',
				mapping,
				data.buffer,
			);
			expect(invoiceService.generate).toHaveBeenCalledWith(
				mockTransformedData,
				{
					format: 'ubl',
					lang: 'en',
					data,
					pdf: undefined,
					attachments: [],
				},
			);
		});

		it('should throw a BadRequestException if no invoice file is uploaded', async () => {
			const mapping = 'test: data success';
			const response = await request(app.getHttpServer())
				.post('/invoice/create/UBL')
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
			const transformMock = jest
				.spyOn(mappingService, 'transform')
				.mockImplementation(() => {
					throw new ValidationError([error]);
				});

			const response = await request(app.getHttpServer())
				.post('/invoice/create/UBL')
				.attach('mapping', Buffer.from('test: data fail'), 'mapping.yaml')
				.attach('data', Buffer.from('test data'), 'invoice.ods');

			expect(response.status).toBe(400);
			expect(response.body.message).toEqual('Transformation failed.');
			const details = response.body.details;
			expect(details.errors.length).toBe(1);
			expect(details.errors[0]).toEqual(error);

			transformMock.mockRestore();
		});

		it('should throw InternalServerErrorException for unknown errors', async () => {
			const format = 'UBL';
			const files = {
				data: [],
				mapping: [],
			};

			jest.spyOn(mappingService, 'transform').mockImplementation(() => {
				throw new Error('boum!');
			});

			await expect(
				controller.transformAndCreate({} as Response, format, files, {}),
			).rejects.toThrow(InternalServerErrorException);

			expect(mockedLogger.error).toHaveBeenCalledTimes(1);
		});
	});
});
