/**
 * Dartmouth OS V2.0 - Logger
 * Centralized logging utility
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export class Logger {
  constructor(
    private context: string,
    private environment: string = 'development'
  ) {}

  debug(message: string, data?: any): void {
    this.log('debug', message, data);
  }

  info(message: string, data?: any): void {
    this.log('info', message, data);
  }

  warn(message: string, data?: any): void {
    this.log('warn', message, data);
  }

  error(message: string, error?: Error | any): void {
    this.log('error', message, error);
  }

  private log(level: LogLevel, message: string, data?: any): void {
    const timestamp = new Date().toISOString();

    // In development, log to console
    if (this.environment === 'development') {
      const logMethod = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;
      logMethod(`[${timestamp}] [${level.toUpperCase()}] [${this.context}] ${message}`, data || '');
    }

    // In production, send to analytics/monitoring
    // (This would integrate with Cloudflare Analytics, Sentry, etc.)
    // const logEntry = { timestamp, level, context: this.context, message, ...(data && { data }) };
  }
}

