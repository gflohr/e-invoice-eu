import { ErrorObject, ValidateFunction, ValidationError } from 'ajv/dist/2019';

import { Logger } from '../logger.interface';

export class ValidationService {
	constructor(private readonly logger: Logger) {}

	validate<T>(id: string, f: ValidateFunction<T>, data: unknown): T {
		if (f(data)) {
			return data as T;
		} else {
			this.logger.error(`Invalid ${id}: ${JSON.stringify(f.errors, null, 4)}`);
			throw new ValidationError(f.errors as ErrorObject[]);
		}
	}
}
