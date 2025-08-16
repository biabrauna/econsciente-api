import { Injectable, LoggerService } from '@nestjs/common';

interface LogContext {
  correlationId?: string;
  userId?: string;
  method?: string;
  url?: string;
  [key: string]: any;
}

@Injectable()
export class CustomLoggerService implements LoggerService {
  private formatMessage(level: string, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...context,
    };
    return JSON.stringify(logEntry);
  }

  log(message: string, context?: LogContext) {
    console.log(this.formatMessage('info', message, context));
  }

  error(message: string, context?: LogContext, trace?: string) {
    const errorContext = { ...context, trace };
    console.error(this.formatMessage('error', message, errorContext));
  }

  warn(message: string, context?: LogContext) {
    console.warn(this.formatMessage('warn', message, context));
  }

  debug(message: string, context?: LogContext) {
    console.debug(this.formatMessage('debug', message, context));
  }

  verbose(message: string, context?: LogContext) {
    console.log(this.formatMessage('verbose', message, context));
  }

  // Convenience methods for common log patterns
  logRequest(method: string, url: string, correlationId: string, userId?: string) {
    this.log('Incoming request', {
      method,
      url,
      correlationId,
      userId,
      type: 'request',
    });
  }

  logResponse(method: string, url: string, statusCode: number, duration: number, correlationId: string) {
    this.log('Response sent', {
      method,
      url,
      statusCode,
      duration: `${duration}ms`,
      correlationId,
      type: 'response',
    });
  }

  logUserAction(action: string, userId: string, details?: any) {
    this.log(`User action: ${action}`, {
      userId,
      action,
      ...details,
      type: 'user_action',
    });
  }

  logDatabaseQuery(query: string, duration?: number, userId?: string) {
    this.log('Database query executed', {
      query,
      duration: duration ? `${duration}ms` : undefined,
      userId,
      type: 'database',
    });
  }

  logError(error: Error, context?: LogContext) {
    this.error(error.message, {
      ...context,
      errorName: error.name,
      stack: error.stack,
      type: 'error',
    });
  }
}