import { ErrorObject, ValidateFunction, ValidationError } from 'ajv';

import { ValidationService } from './validation.service';
import { Logger } from '../logger.interface';

describe('ValidationService', () => {
	let logger: Logger;
	let service: ValidationService;
	let mockValidate: ValidateFunction;

	beforeEach(async () => {
		logger = {
			error: jest.fn(),
		} as unknown as Logger;

		service = new ValidationService(logger);

		// Mock the validate function
		mockValidate = jest.fn() as unknown as ValidateFunction;
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	it('should return data when validation succeeds', () => {
		const validData = { name: 'John', age: 30 };

		// Simulate successful validation
		(mockValidate as unknown as jest.Mock).mockReturnValue(true);

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
		(mockValidate as unknown as jest.Mock).mockReturnValue(false);
		mockValidate.errors = errors;

		expect(() => service.validate('test', mockValidate, invalidData)).toThrow(
			ValidationError,
		);

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
