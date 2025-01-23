import {
	Injectable,
	NestInterceptor,
	ExecutionContext,
	CallHandler,
	Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
	private readonly logger = new Logger('Request');

	intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
		const request = context.switchToHttp().getRequest();
		const { method, originalUrl } = request;
		const start = Date.now();

		const response = context.switchToHttp().getResponse();

		return next.handle().pipe(
			tap(() => {
				const duration = Date.now() - start;
				const statusCode = response.statusCode;
				this.logger.log(
					`${method} ${originalUrl} ${statusCode} - ${duration}ms`,
				);
			}),
		);
	}
}
