import { Test, TestingModule } from '@nestjs/testing';

import { InvoiceService } from './invoice.service';
import { AppConfigService } from '../app-config/app-config.service';
import { FormatFactoryService } from '../format/format.factory.service';
import { SerializerService } from '../serializer/serializer.service';
import { ValidationService } from '../validation/validation.service';

describe('InvoiceService', () => {
	let service: InvoiceService;
	let validationService: ValidationService;

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
				SerializerService,
				{
					provide: 'SerializerService',
					useValue: {},
				},
				ValidationService,
				{
					provide: 'ValidationService',
					useValue: {
						validate: jest.fn(),
					},
				},
			],
		}).compile();

		service = module.get<InvoiceService>(InvoiceService);
		validationService = module.get<ValidationService>(ValidationService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	it('should validate input data and create an invoice', async () => {
		const validateSpy = jest
			.spyOn(validationService, 'validate')
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
	});
});
