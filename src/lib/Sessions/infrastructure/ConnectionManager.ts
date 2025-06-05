import { Injectable, Inject } from '@nestjs/common';
import { Boom } from '@hapi/boom';
import { DisconnectReason } from 'baileys';
import { IConnectionManager } from './interfaces/IConnectionManager';
import { ConnectionPort } from '../domain/ports/ConnectionPort';
import { QrCounterPort } from '../domain/ports/QrCounterPort';
import { IQrManager } from './interfaces/IQrManager';
import { ISessionStateManager } from './interfaces/ISessionStateManager';
import { ISessionLogger } from './interfaces/ISessionLogger';
import { ISessionLogLogger } from '../../SessionLogs/infrastructure/interfaces/ISessionLogLogger';
import * as qrcode from 'qrcode-terminal';

@Injectable()
export class ConnectionManager implements IConnectionManager, ConnectionPort {
  private sessionStateManager: ISessionStateManager | null = null;
  constructor(
    private readonly qrManager: IQrManager,
    private readonly qrCounterManager: QrCounterPort,
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
    // this.logger.info('Credentials updated', sessionId);
  }
  private async pauseSessionOnQrLimit(sessionId: string): Promise<void> {
    try {
      // Check if session is already paused to avoid duplicate operations
      if (this.sessionStateManager) {
        const isPaused =
          await this.sessionStateManager.isSessionPaused(sessionId);
        if (isPaused) {
          return; // Session already paused, avoid duplicate operations
        }
      }

      this.logger.error(`QR limit exceeded. Pausing session.`, sessionId);

      // Clean up QR data and counter
      this.qrManager.removeQr(sessionId);
      this.qrCounterManager.removeSession(sessionId);

      // Pause the session
      if (this.sessionStateManager) {
        await this.sessionStateManager.pauseSession(sessionId);
      }

      // Single log entry for the event
      await this.sessionLogLogger.logWarning(
        sessionId,
        'Session paused due to QR generation limit exceeded',
        'QR_LIMIT_EXCEEDED',
      );
    } catch (error) {
      this.logger.error('Error pausing session on QR limit', error, sessionId);
    }
  }
  private async handleQrGeneration(
    sessionId: string,
    qr: string,
  ): Promise<void> {
    // Check if QR generation limit has been exceeded
    if (!this.qrCounterManager.canGenerateQr(sessionId)) {
      // Pause the session when QR limit is reached
      await this.pauseSessionOnQrLimit(sessionId);
      return;
    }

    // Increment QR counter
    const newCount = this.qrCounterManager.incrementCounter(sessionId);

    this.qrManager.storeQr(sessionId, qr);

    // Simple QR generation log
    // this.logger.info(
    //   `QR generated (${newCount}/${this.qrCounterManager.getMaxLimit()})`,
    //   sessionId,
    // );

    // Log QR generation event
    await this.sessionLogLogger.logQrEvent(sessionId);

    qrcode.generate(qr, { small: true });

    // Check if we've reached the limit after generating this QR
    if (this.qrCounterManager.hasExceededLimit(sessionId)) {
      // Pause session after showing the last QR with a delay
      setTimeout(async () => {
        await this.pauseSessionOnQrLimit(sessionId);
      }, 30000); // Wait 30 seconds to allow QR scanning
    }
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
            // this.logger.info('Auto-reconnecting session', sessionId);
            await this.sessionLogLogger.logReconnection(sessionId, reason);
            await this.sessionStateManager.recreateSession(sessionId);
          } else {
            // this.logger.info(
            //   'Session is paused, not auto-reconnecting',
            //   sessionId,
            // );
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
      // this.logger.info('Session closed by logout', sessionId);
      // Reset QR counter on logout since session will need to reauth
      this.qrCounterManager.resetCounter(sessionId);
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

    // this.logger.info('Session connected successfully', sessionId);

    // Log connection event
    await this.sessionLogLogger.logConnectionEvent(sessionId, true);
    await this.sessionLogLogger.logAuthEvent(sessionId, true);
  }
}
