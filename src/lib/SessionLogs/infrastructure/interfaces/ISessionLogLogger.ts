import { SessionLogType } from '../../domain/SessionLogLogType';

export interface ISessionLogLogger {
  logSessionEvent(
    sessionId: string,
    logType: SessionLogType,
    message: string,
  ): Promise<void>;

  logConnectionEvent(
    sessionId: string,
    connected: boolean,
    reason?: string,
  ): Promise<void>;

  logQrEvent(sessionId: string, qrCode?: string): Promise<void>;

  logAuthEvent(
    sessionId: string,
    success: boolean,
    error?: string,
  ): Promise<void>;

  logError(
    sessionId: string,
    error: Error | string,
    context?: string,
  ): Promise<void>;

  logWarning(
    sessionId: string,
    message: string,
    context?: string,
  ): Promise<void>;
  logInfo(sessionId: string, message: string, context?: string): Promise<void>;

  // Session lifecycle methods
  logSessionStart(sessionId: string): Promise<void>;
  logSessionStop(sessionId: string): Promise<void>;
  logSessionPause(sessionId: string): Promise<void>;
  logSessionResume(sessionId: string): Promise<void>;
  logReconnection(sessionId: string, reason?: string): Promise<void>;

  // Message related methods
  logMessageSent(
    sessionId: string,
    messageId: string,
    to: string,
  ): Promise<void>;
  logMessageReceived(
    sessionId: string,
    messageId: string,
    from: string,
  ): Promise<void>;
  logMessageFailed(
    sessionId: string,
    messageId: string,
    error: string,
  ): Promise<void>;
}
