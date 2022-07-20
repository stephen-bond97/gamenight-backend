import { ConsoleLogger } from "./console.logger";
import { ILogger } from "./ilogger";
import { SentryLogger } from "./sentry.logger";

export class LoggerFactory {
    public static CreateLogger(): ILogger {
        if (process.env.ENVIRONMENT == "DEVELOPMENT") {
            return new ConsoleLogger();
        }

        return new SentryLogger();
    }
}