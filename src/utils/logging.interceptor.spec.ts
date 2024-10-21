import { LoggingInterceptor } from './logging.interceptor';
import { ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { of } from 'rxjs';

describe('LoggingInterceptor', () => {
	let interceptor: LoggingInterceptor;
	let mockContext: Partial<ExecutionContext>;
	let mockCallHandler: Partial<CallHandler>;

	beforeEach(() => {
		jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});

		interceptor = new LoggingInterceptor();

		mockContext = {
			switchToHttp: jest.fn().mockReturnValue({
				getRequest: jest.fn().mockReturnValue({
					method: 'GET',
					originalUrl: '/test-url',
				}),
				getResponse: jest.fn().mockReturnValue({
					statusCode: 200,
				}),
			}),
		};

		mockCallHandler = {
			handle: jest.fn().mockReturnValue(of('test-data')), // mock observable
		};
	});

	it('should log the method, URL, status code, and duration', done => {
		interceptor
			.intercept(
				mockContext as ExecutionContext,
				mockCallHandler as CallHandler,
			)
			.subscribe(() => {
				expect(Logger.prototype.log).toHaveBeenCalledWith(
					expect.stringContaining('GET /test-url 200 -'),
				);
				done();
			});
	});
});
