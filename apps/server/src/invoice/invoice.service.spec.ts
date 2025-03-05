import { ValidationService } from '@e-invoice-eu/core';
import { Test, TestingModule } from '@nestjs/testing';
import { ErrorObject, ValidationError } from 'ajv/dist/2019';

import { InvoiceService } from './invoice.service';
import { AppConfigService } from '../app-config/app-config.service';
import { FormatFactoryService } from '../format/format.factory.service';

describe('InvoiceService', () => {
	let service: InvoiceService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				InvoiceService,
				AppConfigService,
				{
					provide: 'AppConfigService',
					useValue: {},
				},
				FormatFactoryService,
				{
					provide: 'FormatFactoryService',
					useValue: {},
				},
			],
		}).compile();

		service = module.get<InvoiceService>(InvoiceService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	it('should validate input data and create an invoice', async () => {
		const validateSpy = jest
			.spyOn(ValidationService.prototype, 'validate')
			.mockReturnValue({ 'ubl:Invoice': {} });

		const input = {} as unknown;
		const got = await service.generate(input, {
			lang: 'en-us',
			format: 'UBL',
			attachments: [],
		});

		expect(got).toMatchSnapshot();

		expect(validateSpy).toHaveBeenCalledTimes(1);
		expect(validateSpy).toHaveBeenCalledWith(
			'invoice data',
			expect.anything(),
			input,
		);

		validateSpy.mockRestore();
	});

	it('should reject invalid input data', async () => {
		const validateSpy = jest
			.spyOn(ValidationService.prototype, 'validate')
			.mockImplementationOnce(() => {
				// FIXME: Use more specific error here!
				throw new ValidationError([] as ErrorObject[]);
			});

		const input = {} as unknown;

		try {
			await service.generate(input, {
				lang: 'en-us',
				format: 'UBL',
				attachments: [],
			});
			fail('Expected generate() to throw a ValidationError.');
		} catch (error) {
			expect(error).toBeInstanceOf(ValidationError);
			expect(error.errors).toEqual([]);
		}

		expect(validateSpy).toHaveBeenCalledTimes(1);
		expect(validateSpy).toHaveBeenCalledWith(
			'invoice data',
			expect.anything(),
			input,
		);

		validateSpy.mockRestore();
	});
});
