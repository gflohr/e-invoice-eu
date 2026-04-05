import { ErrorObject, ValidateFunction, ValidationError } from 'ajv';
import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { Logger } from '../logger.interface';
import { ValidationService } from './validation.service';

describe('ValidationService', () => {
	let logger: Logger;
	let service: ValidationService;
	let mockValidate: ValidateFunction & Mock;

	beforeEach(async () => {
		logger = {
			error: vi.fn(),
		} as unknown as Logger;

		service = new ValidationService(logger);

		// Mock the validate function
		mockValidate = vi.fn() as unknown as ValidateFunction & Mock;
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	it('should return data when validation succeeds', () => {
		const validData = { name: 'John', age: 30 };

		// Simulate successful validation
		mockValidate.mockReturnValue(true);

		expect(service.validate('test', mockValidate, validData)).toEqual(
			validData,
		);
		expect(logger.error).not.toHaveBeenCalled();
	});

	it('should throw a ValidationError when validation fails', () => {
		const invalidData = { name: 'John' }; // Missing 'age'

		const errors: ErrorObject[] = [
			{
				message: "must have required property 'age'",
				keyword: 'required',
				params: { missingProperty: 'age' },
				schemaPath: '.required',
			} as unknown as ErrorObject,
		];
		mockValidate.mockReturnValue(false);
		mockValidate.errors = errors;

		expect(() =>
			service.validate('test', mockValidate, invalidData),
		).toThrow(ValidationError);

		try {
			service.validate('test', mockValidate, invalidData);
		} catch (error) {
			expect(error).toBeInstanceOf(ValidationError);
			expect(error.message).toBe('validation failed');
			expect(error.errors).toEqual(errors);
		}
		expect(logger.error).toHaveBeenCalledTimes(2);
	});
});
