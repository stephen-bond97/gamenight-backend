import * as Sentry from '@sentry/node';
import * as Tracing from '@sentry/tracing';
import { ILogger } from './ilogger';

export class SentryLogger implements ILogger {
    /**
     *
     */
    public constructor() {
        Sentry.init({
            dsn: process.env.SENTRY_DSN
          });
    }
    public Error(message: string): void {
        Sentry.captureMessage(message, "error");
    }
    public Warning(message: string): void {
        Sentry.captureMessage(message, "warning");
    }
    public Debug(message: string): void {
        Sentry.captureMessage(message, "debug");
    }
    public Info(message: string): void {
        Sentry.captureMessage(message, "info");
    }
}