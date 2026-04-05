import { ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { lastValueFrom, of } from 'rxjs';
import { vi, describe, it, beforeEach, expect } from 'vitest';

import { LoggingInterceptor } from './logging.interceptor';

describe('LoggingInterceptor', () => {
	let interceptor: LoggingInterceptor;
	let mockContext: Partial<ExecutionContext>;
	let mockCallHandler: Partial<CallHandler>;

	beforeEach(() => {
		vi.spyOn(Logger.prototype, 'log').mockImplementation(() => {});

		interceptor = new LoggingInterceptor();

		mockContext = {
			switchToHttp: vi.fn().mockReturnValue({
				getRequest: vi.fn().mockReturnValue({
					method: 'GET',
					originalUrl: '/test-url',
				}),
				getResponse: vi.fn().mockReturnValue({
					statusCode: 200,
				}),
			}),
		};

		mockCallHandler = {
			handle: vi.fn().mockReturnValue(of('test-data')),
		};
	});

	it('should log the method, URL, status code, and duration', async () => {
		await lastValueFrom(
			interceptor.intercept(
				mockContext as ExecutionContext,
				mockCallHandler as CallHandler,
			),
		);

		expect(Logger.prototype.log).toHaveBeenCalledWith(
			expect.stringContaining('GET /test-url 200 -'),
		);
	});
});
