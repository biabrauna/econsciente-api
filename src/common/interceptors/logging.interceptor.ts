import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const { method, url, ip } = request;
    const userAgent = request.get('User-Agent') || '';
    const correlationId = this.generateCorrelationId();

    // Add correlation ID to response headers
    response.setHeader('X-Correlation-ID', correlationId);

    const startTime = Date.now();

    this.logger.log(
      JSON.stringify({
        type: 'request',
        correlationId,
        method,
        url,
        ip,
        userAgent,
        timestamp: new Date().toISOString(),
      }),
    );

    return next.handle().pipe(
      tap(() => {
        const endTime = Date.now();
        const duration = endTime - startTime;

        this.logger.log(
          JSON.stringify({
            type: 'response',
            correlationId,
            method,
            url,
            statusCode: response.statusCode,
            duration: `${duration}ms`,
            timestamp: new Date().toISOString(),
          }),
        );
      }),
    );
  }

  private generateCorrelationId(): string {
    return Math.random().toString(36).substring(2, 15) +
           Math.random().toString(36).substring(2, 15);
  }
}