import { ConsoleLogger } from "./console.logger";
import { ILogger } from "./ilogger";

export class LoggerFactory {
    public static CreateLogger(): ILogger {
        return new ConsoleLogger();
    }
}