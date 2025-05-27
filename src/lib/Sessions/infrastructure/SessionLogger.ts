import { Injectable, Inject } from '@nestjs/common';
import { ISessionLogger } from './interfaces/ISessionLogger';

@Injectable()
export class SessionLogger implements ISessionLogger {
  constructor() {}

  info(message: string, sessionId?: string): void {
    const prefix = sessionId ? `[${sessionId}]` : '';
    console.log(`ℹ️ ${prefix} ${message}`);
  }

  warn(message: string, sessionId?: string): void {
    const prefix = sessionId ? `[${sessionId}]` : '';
    console.warn(`⚠️ ${prefix} ${message}`);
  }

  error(message: string, error?: any, sessionId?: string): void {
    const prefix = sessionId ? `[${sessionId}]` : '';
    console.error(`❌ ${prefix} ${message}`, error);
  }
}
