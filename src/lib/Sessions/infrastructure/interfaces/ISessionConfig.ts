export interface ISessionConfig {
  reconnectionTimeout: number;
  deleteTimeout: number;
  restartTimeout: number;
  qrTimeout: number;
  maxRetries: number;
  retryDelay: number;
  logLevel: 'debug' | 'info' | 'warn' | 'error' | 'silent';
}
