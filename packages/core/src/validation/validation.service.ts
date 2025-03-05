import { ErrorObject, ValidateFunction, ValidationError } from 'ajv';

import { ILogger } from '../ilogger';

export class ValidationService {
	constructor(private readonly logger: ILogger) {}

	validate<T>(id: string, f: ValidateFunction<T>, data: unknown): T {
		if (f(data)) {
			return data as T;
		} else {
			this.logger.error(`Invalid ${id}: ${JSON.stringify(f.errors, null, 4)}`);
			throw new ValidationError(f.errors as ErrorObject[]);
		}
	}
}
