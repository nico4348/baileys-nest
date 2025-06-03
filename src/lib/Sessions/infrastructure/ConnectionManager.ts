import { Injectable, Inject } from '@nestjs/common';
import { Boom } from '@hapi/boom';
import { DisconnectReason } from 'baileys';
import { IConnectionManager } from './interfaces/IConnectionManager';
import { ConnectionPort } from '../domain/ports/ConnectionPort';
import { IQrManager } from './interfaces/IQrManager';
import { ISessionStateManager } from './interfaces/ISessionStateManager';
import { ISessionLogger } from './interfaces/ISessionLogger';
import { ISessionLogLogger } from '../../SessionLogs/infrastructure/interfaces/ISessionLogLogger';
import { QrCounterManager } from './QrCounterManager';
import * as qrcode from 'qrcode-terminal';

@Injectable()
export class ConnectionManager implements IConnectionManager, ConnectionPort {
  private sessionStateManager: ISessionStateManager | null = null;

  constructor(
    private readonly qrManager: IQrManager,
    private readonly qrCounterManager: QrCounterManager,
    private readonly logger: ISessionLogger,
    @Inject('ISessionLogLogger')
    private readonly sessionLogLogger: ISessionLogLogger,
  ) {}

  setSessionStateManager(sessionStateManager: ISessionStateManager): void {
    this.sessionStateManager = sessionStateManager;
  }

  async handleConnectionUpdate(sessionId: string, update: any): Promise<void> {
    const { connection, lastDisconnect, qr } = update;

    if (qr && !update.state?.creds?.registered) {
      await this.handleQrGeneration(sessionId, qr);
    }

    if (connection === 'close') {
      await this.handleConnectionClose(sessionId, lastDisconnect);
    } else if (connection === 'open') {
      await this.handleConnectionOpen(sessionId, update.state);
    }
  }

  async handleCredentialsUpdate(sessionId: string): Promise<void> {
    this.logger.info('Credentials updated', sessionId);
  }
  private async handleQrGeneration(
    sessionId: string,
    qr: string,
  ): Promise<void> {
    // Check if the session can generate more QR codes
    if (!this.qrCounterManager.canGenerateQr(sessionId)) {
      const maxLimit = this.qrCounterManager.getMaxLimit();
      this.logger.warn(
        `QR limit of ${maxLimit} exceeded for session. Pausing session.`,
        sessionId,
      );

      // Log the QR limit exceeded event
      await this.sessionLogLogger.logError(
        sessionId,
        new Error(`QR generation limit of ${maxLimit} exceeded`),
        'QR_LIMIT_EXCEEDED',
      );

      // Pause the session to prevent further QR generation
      if (this.sessionStateManager) {
        await this.sessionStateManager.pauseSession(sessionId);
        this.logger.info('Session paused due to QR limit exceeded', sessionId);
      }

      return;
    }

    // Increment the QR counter
    const currentCount = this.qrCounterManager.incrementCounter(sessionId);
    const remainingAttempts =
      this.qrCounterManager.getRemainingAttempts(sessionId);

    this.qrManager.storeQr(sessionId, qr);

    if (this.sessionStateManager) {
      const isPaused =
        await this.sessionStateManager.isSessionPaused(sessionId);
      if (isPaused) {
        this.logger.warn('QR generated for PAUSED session', sessionId);
      } else {
        this.logger.info(
          `QR generated for session (${currentCount}/${this.qrCounterManager.getMaxLimit()}, ${remainingAttempts} remaining)`,
          sessionId,
        );
      }
    } else {
      this.logger.info(
        `QR generated for session (${currentCount}/${this.qrCounterManager.getMaxLimit()}, ${remainingAttempts} remaining)`,
        sessionId,
      );
    }

    // Log QR generation event with counter information
    await this.sessionLogLogger.logQrEvent(sessionId);

    qrcode.generate(qr, { small: true });
  }
  private async handleConnectionClose(
    sessionId: string,
    lastDisconnect: any,
  ): Promise<void> {
    const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;
    const reason = lastDisconnect?.error?.message || 'Unknown reason';

    // Log disconnection event
    await this.sessionLogLogger.logConnectionEvent(sessionId, false, reason);

    if (statusCode !== DisconnectReason.loggedOut) {
      try {
        if (this.sessionStateManager) {
          const isPaused =
            await this.sessionStateManager.isSessionPaused(sessionId);

          if (!isPaused) {
            this.logger.info('Auto-reconnecting session', sessionId);
            await this.sessionLogLogger.logReconnection(sessionId, reason);
            await this.sessionStateManager.recreateSession(sessionId);
          } else {
            this.logger.info(
              'Session is paused, not auto-reconnecting',
              sessionId,
            );
          }
        } else {
          this.logger.warn(
            'SessionStateManager not available for reconnection',
            sessionId,
          );
        }
      } catch (error) {
        this.logger.error('Error during reconnection', error, sessionId);
        await this.sessionLogLogger.logError(
          sessionId,
          error,
          'Reconnection failed',
        );
      }
    } else {
      this.logger.info('Session closed by logout', sessionId);
    }
  }
  private async handleConnectionOpen(
    sessionId: string,
    state: any,
  ): Promise<void> {
    if (!state?.creds?.registered) {
      state.creds.registered = true;
    }

    this.qrManager.removeQr(sessionId);

    // Reset QR counter on successful connection
    this.qrCounterManager.resetCounter(sessionId);

    this.logger.info('Session connected successfully', sessionId);

    // Log connection event
    await this.sessionLogLogger.logConnectionEvent(sessionId, true);
    await this.sessionLogLogger.logAuthEvent(sessionId, true);
  }
}
