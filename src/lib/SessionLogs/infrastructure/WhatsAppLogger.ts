import { Injectable } from '@nestjs/common';
import { SessionLogsCreate } from '../application/SessionLogsCreate';
import { SessionLogType } from '../domain/SessionLogLogType';
import { ISessionLogLogger } from './interfaces/ISessionLogLogger';

@Injectable()
export class WhatsAppLogger implements ISessionLogLogger {
  constructor(private readonly sessionLogsCreate: SessionLogsCreate) {}
  async logSessionEvent(
    sessionId: string,
    logType: SessionLogType,
    message: string,
  ): Promise<void> {
    try {
      await this.sessionLogsCreate.run(sessionId, logType, message);
      console.log(`[${sessionId}] ${logType}: ${message}`);
    } catch (error) {
      console.error(`Failed to log session event for ${sessionId}:`, error);
    }
  }
  async logConnectionEvent(
    sessionId: string,
    connected: boolean,
    reason?: string,
  ): Promise<void> {
    const logType = connected
      ? SessionLogType.CONNECTION
      : SessionLogType.DISCONNECTION;
    const message = connected
      ? 'Session connected successfully'
      : `Session disconnected${reason ? `: ${reason}` : ''}`;

    await this.logSessionEvent(sessionId, logType, message);
  }

  async logQrEvent(sessionId: string, qrCode?: string): Promise<void> {
    const message = 'QR code generated for session';

    await this.logSessionEvent(sessionId, SessionLogType.QR_GENERATED, message);
  }

  async logAuthEvent(
    sessionId: string,
    success: boolean,
    error?: string,
  ): Promise<void> {
    const logType = success
      ? SessionLogType.AUTH_SUCCESS
      : SessionLogType.AUTH_FAILURE;
    const message = success
      ? 'Authentication successful'
      : `Authentication failed${error ? `: ${error}` : ''}`;

    await this.logSessionEvent(sessionId, logType, message);
  }

  async logError(
    sessionId: string,
    error: Error | string,
    context?: string,
  ): Promise<void> {
    const errorMessage = error instanceof Error ? error.message : error;
    const message = context ? `${context}: ${errorMessage}` : errorMessage;

    await this.logSessionEvent(sessionId, SessionLogType.ERROR, message);
  }

  async logWarning(
    sessionId: string,
    message: string,
    context?: string,
  ): Promise<void> {
    const fullMessage = context ? `${context}: ${message}` : message;

    await this.logSessionEvent(sessionId, SessionLogType.WARNING, fullMessage);
  }

  async logInfo(
    sessionId: string,
    message: string,
    context?: string,
  ): Promise<void> {
    const fullMessage = context ? `${context}: ${message}` : message;

    await this.logSessionEvent(sessionId, SessionLogType.INFO, fullMessage);
  }

  // Session lifecycle specific methods
  async logSessionStart(sessionId: string): Promise<void> {
    await this.logSessionEvent(
      sessionId,
      SessionLogType.SESSION_START,
      'Session started',
    );
  }

  async logSessionStop(sessionId: string): Promise<void> {
    await this.logSessionEvent(
      sessionId,
      SessionLogType.SESSION_STOP,
      'Session stopped',
    );
  }

  async logSessionPause(sessionId: string): Promise<void> {
    await this.logSessionEvent(
      sessionId,
      SessionLogType.SESSION_PAUSE,
      'Session paused',
    );
  }

  async logSessionResume(sessionId: string): Promise<void> {
    await this.logSessionEvent(
      sessionId,
      SessionLogType.SESSION_RESUME,
      'Session resumed',
    );
  }
  async logReconnection(sessionId: string, reason?: string): Promise<void> {
    const message = `Session reconnecting${reason ? `: ${reason}` : ''}`;

    await this.logSessionEvent(sessionId, SessionLogType.RECONNECTION, message);
  }

  // Message related logging
  async logMessageSent(
    sessionId: string,
    messageId: string,
    to: string,
  ): Promise<void> {
    const message = `Message sent to ${to} (ID: ${messageId})`;

    await this.logSessionEvent(sessionId, SessionLogType.MESSAGE_SENT, message);
  }

  async logMessageReceived(
    sessionId: string,
    messageId: string,
    from: string,
  ): Promise<void> {
    const message = `Message received from ${from} (ID: ${messageId})`;

    await this.logSessionEvent(
      sessionId,
      SessionLogType.MESSAGE_RECEIVED,
      message,
    );
  }

  async logMessageFailed(
    sessionId: string,
    messageId: string,
    error: string,
  ): Promise<void> {
    const message = `Message failed (ID: ${messageId}): ${error}`;

    await this.logSessionEvent(
      sessionId,
      SessionLogType.MESSAGE_FAILED,
      message,
    );
  }
}
