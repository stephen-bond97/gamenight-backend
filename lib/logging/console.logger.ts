import { ILogger } from "./ilogger";

export class ConsoleLogger implements ILogger {
    /**
     *
     */
    constructor() {
        console.log("creating a console logger");        
    }

    public Error(message: string): void {
        console.error(message);
    }

    public Warning(message: string): void {
        console.warn(message);
    }

    public Debug(message: string): void {
        console.debug(message);
    }

    public Info(message: string): void {
        console.info(message);
    }
}