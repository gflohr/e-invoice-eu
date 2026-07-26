import { ErrorObject, ValidationError } from 'ajv/dist/2019';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ValidationService } from '../validation/validation.service';
import { Invoice } from './invoice.interface';
import { InvoiceService } from './invoice.service';

describe('InvoiceService', () => {
	const logger = {
		log: vi.fn(),
		warn: vi.fn(),
		error: vi.fn(),
	};
	let service: InvoiceService;

	beforeEach(async () => {
		service = new InvoiceService(logger);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	it('should validate input data and create an invoice', async () => {
		const validateSpy = vi
			.spyOn(ValidationService.prototype, 'validate')
			.mockReturnValue({ 'ubl:Invoice': {} });

		const input = {} as unknown as Invoice;
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
		const validateSpy = vi
			.spyOn(ValidationService.prototype, 'validate')
			.mockImplementationOnce(() => {
				// FIXME: Use more specific error here!
				throw new ValidationError([] as ErrorObject[]);
			});

		const input = {} as unknown as Invoice;

		await expect(
			service.generate(input, {
				lang: 'en-us',
				format: 'UBL',
				attachments: [],
			}),
		).rejects.toBeInstanceOf(ValidationError);

		expect(validateSpy).toHaveBeenCalledTimes(1);
		expect(validateSpy).toHaveBeenCalledWith(
			'invoice data',
			expect.anything(),
			input,
		);

		validateSpy.mockRestore();
	});

	describe('Regressions', () => {
		describe('#569 CII DueDateTypeCode (BT-8) never emitted from cac:InvoicePeriod/cbc:DescriptionCode', () => {
			const mockLogger = {
				log: vi.fn(),
				warn: vi.fn(),
				error: vi.fn(),
			};

			it('should auto-convert the date time code to UBL', async () => {
				const invoice: Invoice = {
					'ubl:Invoice': {
						'cac:InvoicePeriod': {
							'cbc:DescriptionCode': '72',
						},
					},
				} as Invoice;
				const invoiceService = new InvoiceService(mockLogger);
				vi.spyOn(
					ValidationService.prototype,
					'validate',
				).mockReturnValue(invoice);

				const xml = await invoiceService.generate(invoice, {
					format: 'UBL',
					lang: 'en',
				});
				expect(xml).toContain(
					'<cbc:DescriptionCode>432</cbc:DescriptionCode>',
				);
				expect(xml).toMatchSnapshot();
			});

			it('should auto-convert the date time code to CII', async () => {
				const invoice: Invoice = {
					'ubl:Invoice': {
						'cac:InvoicePeriod': {
							'cbc:DescriptionCode': '432',
						},
						'cac:TaxTotal': [
							{
								'cac:TaxSubtotal': [
									{
										'cac:TaxCategory': {
											'cbc:ID': 'S',
											'cbc:Percent': '20',
											'cac:TaxScheme': {
												'cbc:ID': 'VAT',
											},
										},
									},
								],
							},
						],
					},
				} as Invoice;
				const invoiceService = new InvoiceService(mockLogger);
				vi.spyOn(
					ValidationService.prototype,
					'validate',
				).mockReturnValue(invoice);

				const xml = await invoiceService.generate(invoice, {
					format: 'CII',
					lang: 'en',
				});
				expect(xml).toContain(
					'<ram:DueDateTypeCode>72</ram:DueDateTypeCode>',
				);
				expect(xml).toMatchSnapshot();
			});
		});
	});
});
