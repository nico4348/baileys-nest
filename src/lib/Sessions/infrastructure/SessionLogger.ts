import { Injectable, Inject } from '@nestjs/common';
import { ISessionLogger } from './interfaces/ISessionLogger';
import { ISessionLogLogger } from '../../SessionLogs/infrastructure/interfaces/ISessionLogLogger';
import { SessionLogType } from '../../SessionLogs/domain/SessionLogLogType';

@Injectable()
export class SessionLogger implements ISessionLogger {
  constructor(
    @Inject('ISessionLogLogger')
    private readonly sessionLogLogger: ISessionLogLogger,
  ) {}

  info(message: string, sessionId?: string): void {
    const prefix = sessionId ? `[${sessionId}]` : '';
    console.log(`ℹ️ ${prefix} ${message}`);

    if (sessionId) {
      this.sessionLogLogger.logInfo(sessionId, message, 'SessionLogger').catch(console.error);
    }
  }

  warn(message: string, sessionId?: string): void {
    const prefix = sessionId ? `[${sessionId}]` : '';
    console.warn(`⚠️ ${prefix} ${message}`);

    if (sessionId) {
      this.sessionLogLogger.logWarning(sessionId, message, 'SessionLogger').catch(console.error);
    }
  }

  error(message: string, error?: any, sessionId?: string): void {
    const prefix = sessionId ? `[${sessionId}]` : '';
    console.error(`❌ ${prefix} ${message}`, error);

    if (sessionId) {
      this.sessionLogLogger.logError(sessionId, error || message, 'SessionLogger').catch(console.error);
    }
  }
}