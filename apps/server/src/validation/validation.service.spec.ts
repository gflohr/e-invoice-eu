import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ErrorObject, ValidateFunction, ValidationError } from 'ajv/dist/2019';

import { ValidationService } from './validation.service';

describe('ValidationService', () => {
	let service: ValidationService;
	let mockValidate: ValidateFunction;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [ValidationService],
		}).compile();

		service = module.get<ValidationService>(ValidationService);

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
	});

	it('should throw ValidationError when validation fails', () => {
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

		jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});

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
	});
});
