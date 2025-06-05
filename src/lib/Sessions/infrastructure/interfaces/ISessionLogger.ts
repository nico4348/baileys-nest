export interface ISessionLogger {
  warn(message: string, sessionId?: string): void;
  error(message: string, error?: any, sessionId?: string): void;
}
