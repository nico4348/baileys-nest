import { Injectable } from '@nestjs/common';
import { Boom } from '@hapi/boom';
import { DisconnectReason } from 'baileys';
import { IConnectionManager } from './interfaces/IConnectionManager';
import { IQrManager } from './interfaces/IQrManager';
import { ISessionStateManager } from './interfaces/ISessionStateManager';
import { ISessionLogger } from './interfaces/ISessionLogger';
import * as qrcode from 'qrcode-terminal';

@Injectable()
export class ConnectionManager implements IConnectionManager {
  private sessionStateManager: ISessionStateManager | null = null;

  constructor(
    private readonly qrManager: IQrManager,
    private readonly logger: ISessionLogger,
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
    this.qrManager.storeQr(sessionId, qr);

    if (this.sessionStateManager) {
      const isPaused =
        await this.sessionStateManager.isSessionPaused(sessionId);
      if (isPaused) {
        this.logger.warn('QR generated for PAUSED session', sessionId);
      } else {
        this.logger.info('QR generated for session', sessionId);
      }
    } else {
      this.logger.info('QR generated for session', sessionId);
    }

    qrcode.generate(qr, { small: true });
  }
  private async handleConnectionClose(
    sessionId: string,
    lastDisconnect: any,
  ): Promise<void> {
    const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;

    if (statusCode !== DisconnectReason.loggedOut) {
      try {
        if (this.sessionStateManager) {
          const isPaused =
            await this.sessionStateManager.isSessionPaused(sessionId);

          if (!isPaused) {
            this.logger.info('Auto-reconnecting session', sessionId);
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
    this.logger.info('Session connected successfully', sessionId);
  }
}
