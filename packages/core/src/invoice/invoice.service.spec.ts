import { ErrorObject, ValidationError } from 'ajv/dist/2019';
import { vi, describe, it, beforeEach, expect } from 'vitest';

import { Invoice } from './invoice.interface';
import { InvoiceService } from './invoice.service';
import { ValidationService } from '../validation/validation.service';

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
});
