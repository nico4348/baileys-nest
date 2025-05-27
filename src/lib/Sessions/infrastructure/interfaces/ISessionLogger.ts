export interface ISessionLogger {
  info(message: string, sessionId?: string): void;
  warn(message: string, sessionId?: string): void;
  error(message: string, error?: any, sessionId?: string): void;
}