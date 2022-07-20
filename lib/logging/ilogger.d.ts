export interface ILogger {
    Error(message: string): void;
    Warning(message: string): void;
    Debug(message: string): void;
    Info(message: string): void;
}