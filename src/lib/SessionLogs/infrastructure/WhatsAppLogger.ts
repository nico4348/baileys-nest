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
    metadata?: Record<string, any>,
  ): Promise<void> {
    try {
      await this.sessionLogsCreate.run(sessionId, logType, message, metadata);
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
    const logType = connected ? SessionLogType.CONNECTION : SessionLogType.DISCONNECTION;
    const message = connected 
      ? 'Session connected successfully'
      : `Session disconnected${reason ? `: ${reason}` : ''}`;
    
    const metadata = reason ? { reason } : undefined;

    await this.logSessionEvent(sessionId, logType, message, metadata);
  }

  async logQrEvent(sessionId: string, qrCode?: string): Promise<void> {
    const message = 'QR code generated for session';
    const metadata = qrCode ? { hasQrCode: true } : undefined;

    await this.logSessionEvent(sessionId, SessionLogType.QR_GENERATED, message, metadata);
  }

  async logAuthEvent(
    sessionId: string,
    success: boolean,
    error?: string,
  ): Promise<void> {
    const logType = success ? SessionLogType.AUTH_SUCCESS : SessionLogType.AUTH_FAILURE;
    const message = success 
      ? 'Authentication successful'
      : `Authentication failed${error ? `: ${error}` : ''}`;
    
    const metadata = error ? { error } : undefined;

    await this.logSessionEvent(sessionId, logType, message, metadata);
  }

  async logError(
    sessionId: string,
    error: Error | string,
    context?: string,
  ): Promise<void> {
    const errorMessage = error instanceof Error ? error.message : error;
    const message = context 
      ? `${context}: ${errorMessage}`
      : errorMessage;

    const metadata = {
      context,
      stack: error instanceof Error ? error.stack : undefined,
    };

    await this.logSessionEvent(sessionId, SessionLogType.ERROR, message, metadata);
  }

  async logWarning(
    sessionId: string,
    message: string,
    context?: string,
  ): Promise<void> {
    const fullMessage = context ? `${context}: ${message}` : message;
    const metadata = context ? { context } : undefined;

    await this.logSessionEvent(sessionId, SessionLogType.WARNING, fullMessage, metadata);
  }

  async logInfo(
    sessionId: string,
    message: string,
    context?: string,
  ): Promise<void> {
    const fullMessage = context ? `${context}: ${message}` : message;
    const metadata = context ? { context } : undefined;

    await this.logSessionEvent(sessionId, SessionLogType.INFO, fullMessage, metadata);
  }

  // Session lifecycle specific methods
  async logSessionStart(sessionId: string): Promise<void> {
    await this.logSessionEvent(sessionId, SessionLogType.SESSION_START, 'Session started');
  }

  async logSessionStop(sessionId: string): Promise<void> {
    await this.logSessionEvent(sessionId, SessionLogType.SESSION_STOP, 'Session stopped');
  }

  async logSessionPause(sessionId: string): Promise<void> {
    await this.logSessionEvent(sessionId, SessionLogType.SESSION_PAUSE, 'Session paused');
  }

  async logSessionResume(sessionId: string): Promise<void> {
    await this.logSessionEvent(sessionId, SessionLogType.SESSION_RESUME, 'Session resumed');
  }

  async logReconnection(sessionId: string, reason?: string): Promise<void> {
    const message = `Session reconnecting${reason ? `: ${reason}` : ''}`;
    const metadata = reason ? { reason } : undefined;

    await this.logSessionEvent(sessionId, SessionLogType.RECONNECTION, message, metadata);
  }

  // Message related logging
  async logMessageSent(sessionId: string, messageId: string, to: string): Promise<void> {
    const message = `Message sent to ${to}`;
    const metadata = { messageId, to };

    await this.logSessionEvent(sessionId, SessionLogType.MESSAGE_SENT, message, metadata);
  }

  async logMessageReceived(sessionId: string, messageId: string, from: string): Promise<void> {
    const message = `Message received from ${from}`;
    const metadata = { messageId, from };

    await this.logSessionEvent(sessionId, SessionLogType.MESSAGE_RECEIVED, message, metadata);
  }

  async logMessageFailed(sessionId: string, messageId: string, error: string): Promise<void> {
    const message = `Message failed: ${error}`;
    const metadata = { messageId, error };

    await this.logSessionEvent(sessionId, SessionLogType.MESSAGE_FAILED, message, metadata);
  }
}
