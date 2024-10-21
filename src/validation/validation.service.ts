import { Injectable, Logger } from '@nestjs/common';
import { ErrorObject, ValidateFunction } from 'ajv';

export class ValidationError extends Error {
	public validationErrors: ErrorObject[];

	constructor(message: string, validationErrors: ErrorObject[]) {
		super(message);
		this.name = 'ValidationError';
		this.validationErrors = [...validationErrors];

		// Ensure the stack trace is captured properly (for Node.js < 10).
		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, ValidationError);
		}
	}
}

@Injectable()
export class ValidationService {
	private readonly logger = new Logger(ValidationService.name);

	validate<T>(id: string, f: ValidateFunction<T>, data: unknown): T {
		if (f(data)) {
			return data as T;
		} else {
			this.logger.error(`Invalid ${id}: ${JSON.stringify(f.errors, null, 4)}`);
			throw new ValidationError(`Invalid ${id}!`, f.errors as ErrorObject[]);
		}
	}
}
