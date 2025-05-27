import { Injectable } from '@nestjs/common';
import { ISessionConfig } from './interfaces/ISessionConfig';

@Injectable()
export class SessionConfig implements ISessionConfig {
  readonly reconnectionTimeout: number;
  readonly deleteTimeout: number;
  readonly restartTimeout: number;
  readonly qrTimeout: number;
  readonly maxRetries: number;
  readonly retryDelay: number;
  readonly logLevel: 'debug' | 'info' | 'warn' | 'error' | 'silent';

  constructor() {
    this.reconnectionTimeout = parseInt(process.env.SESSION_RECONNECTION_TIMEOUT || '30000');
    this.deleteTimeout = parseInt(process.env.SESSION_DELETE_TIMEOUT || '10000');
    this.restartTimeout = parseInt(process.env.SESSION_RESTART_TIMEOUT || '5000');
    this.qrTimeout = parseInt(process.env.SESSION_QR_TIMEOUT || '120000');
    this.maxRetries = parseInt(process.env.SESSION_MAX_RETRIES || '3');
    this.retryDelay = parseInt(process.env.SESSION_RETRY_DELAY || '1000');
    this.logLevel = (process.env.SESSION_LOG_LEVEL as any) || 'info';
  }

  validate(): void {
    if (this.reconnectionTimeout < 0) {
      throw new Error('Reconnection timeout must be non-negative');
    }
    if (this.deleteTimeout < 0) {
      throw new Error('Delete timeout must be non-negative');
    }
    if (this.restartTimeout < 0) {
      throw new Error('Restart timeout must be non-negative');
    }
    if (this.qrTimeout < 0) {
      throw new Error('QR timeout must be non-negative');
    }
    if (this.maxRetries < 0) {
      throw new Error('Max retries must be non-negative');
    }
    if (this.retryDelay < 0) {
      throw new Error('Retry delay must be non-negative');
    }
  }
}