export class Logger {
    public static Error(message: string): void {
        console.error(message);
    }

    public static Warning(message: string): void {
        console.warn(message);
    }

    public static Debug(message: string): void {
        console.debug(message);
    }
}