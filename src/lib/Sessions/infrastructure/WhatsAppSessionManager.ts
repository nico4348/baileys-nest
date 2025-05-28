import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { AuthStateFactory } from '../../AuthState/infrastructure/AuthStateFactory';
import { SessionsRepository } from '../domain/SessionsRepository';
import { WhatsAppSocketFactory } from './Socket';
import { SessionsGetOneById } from '../application/SessionsGetOneById';
import { SessionQrService } from './SessionQrService';
import { SessionOperationsService } from './SessionOperationsService';
import { SessionLifecycleManager } from './SessionLifecycleManager';
import { QrManager } from './QrManager';
import { ConnectionManager } from './ConnectionManager';
import { QrCounterManager } from './QrCounterManager';
import { ISessionStateManager } from './interfaces/ISessionStateManager';
import { ISessionLogger } from './interfaces/ISessionLogger';
import { BaileysEventLogger } from '../../EventLogs/infrastructure/BaileysEventLogger';

@Injectable()
export class WhatsAppSessionManager
  implements ISessionStateManager, OnModuleInit
{
  constructor(
    @Inject('AuthStateFactory')
    private readonly authStateFactory: AuthStateFactory,
    @Inject('SessionsRepository')
    private readonly sessionsRepository: SessionsRepository,
    @Inject('SessionsGetOneById')
    private readonly sessionsGetOneById: SessionsGetOneById,
    private readonly sessionQrService: SessionQrService,
    private readonly sessionOperations: SessionOperationsService,
    private readonly lifecycleManager: SessionLifecycleManager,
    private readonly qrManager: QrManager,
    private readonly connectionManager: ConnectionManager,
    private readonly qrCounterManager: QrCounterManager,
    private readonly logger: ISessionLogger,
    private readonly eventLogger: BaileysEventLogger,
  ) {}

  onModuleInit(): void {
    // Resolve circular dependency
    this.connectionManager.setSessionStateManager(this);
  }
  async startSession(sessionId: string): Promise<any> {
    await this.sessionOperations.startSession(sessionId);

    const existingSocket = this.lifecycleManager.getSession(sessionId);
    if (this.lifecycleManager.isSessionActive(sessionId)) {
      return existingSocket;
    } // Use the qrManager and connectionManager instead of undefined services
    const socketFactory = new WhatsAppSocketFactory(
      this.authStateFactory,
      this.qrManager,
      this.connectionManager,
      this,
      this.eventLogger,
    );

    this.sessionQrService.setSocketFactory(sessionId, socketFactory);
    const socket = await socketFactory.createSocket(sessionId);
    this.lifecycleManager.storeSession(sessionId, socket);

    return socket;
  }
  async resumeSession(sessionId: string): Promise<any> {
    await this.sessionOperations.resumeSession(sessionId);

    // Check if session is in memory and active
    if (this.lifecycleManager.isSessionActive(sessionId)) {
      return this.lifecycleManager.getSession(sessionId);
    } // Check if session is paused and can be resumed
    if (this.lifecycleManager.isPaused(sessionId)) {
      const socketFactory = new WhatsAppSocketFactory(
        this.authStateFactory,
        this.qrManager,
        this.connectionManager,
        this,
        this.eventLogger,
      );

      this.sessionQrService.setSocketFactory(sessionId, socketFactory);
      const socket = await this.lifecycleManager.resumeSession(
        sessionId,
        socketFactory,
      );
      return socket;
    }

    // Otherwise start new session
    return await this.startSession(sessionId);
  }

  async recreateSession(sessionId: string): Promise<any> {
    await this.sessionOperations.restartSession(sessionId);
    this.lifecycleManager.setRestarting(sessionId);

    try {
      await this.lifecycleManager.closeSession(sessionId);
      this.sessionQrService.removeSocketFactory(sessionId);

      const result = await this.startSession(sessionId);
      return result;
    } catch (error) {
      this.logger.error('Failed to recreate session', error, sessionId);
      throw error;
    }
  }

  async pauseSession(sessionId: string): Promise<void> {
    await this.sessionOperations.pauseSession(sessionId);
    await this.lifecycleManager.pauseSession(sessionId);
  }
  async deleteSession(sessionId: string): Promise<void> {
    this.lifecycleManager.setDeleting(sessionId);

    try {
      await this.lifecycleManager.closeSession(sessionId);
      this.sessionQrService.removeSocketFactory(sessionId);

      // Clean up QR counter when session is deleted
      this.qrCounterManager.removeSession(sessionId);

      await this.sessionOperations.deleteSession(sessionId);
    } catch (error) {
      this.logger.error('Failed to delete session', error, sessionId);
      throw error;
    }
  }

  isSessionRestarting(sessionId: string): boolean {
    return this.lifecycleManager.isRestarting(sessionId);
  }

  isSessionDeleting(sessionId: string): boolean {
    return this.lifecycleManager.isDeleting(sessionId);
  }
  async isSessionPaused(sessionId: string): Promise<boolean> {
    // First check if it's marked as paused in lifecycle manager
    if (this.lifecycleManager.isPaused(sessionId)) {
      return true;
    }

    try {
      const session = await this.sessionsGetOneById.run(sessionId);
      if (!session) {
        return true; // Si no existe la sesión, considerarla como pausada
      }
      // Una sesión está pausada si status es false o está marcada como eliminada
      return !session.status.value || session.isDeleted.value;
    } catch (error) {
      console.error(`Error verificando estado de sesión ${sessionId}:`, error);
      return true; // En caso de error, considerar pausada por seguridad
    }
  }
  // QR methods delegated to SessionQrService
  getSessionQR(sessionId: string): string | null {
    return this.sessionQrService.getQr(sessionId);
  }
  hasSessionQR(sessionId: string): boolean {
    return this.sessionQrService.hasQr(sessionId);
  }
  async getSessionQRAsBase64(sessionId: string): Promise<string | null> {
    return await this.sessionQrService.getQrAsBase64(sessionId);
  }

  // Socket access for message sending
  getSocket(sessionId: string): any | null {
    return this.lifecycleManager.getSession(sessionId);
  }

  // QR Counter Manager access
  getQrCounterManager(): QrCounterManager {
    return this.qrCounterManager;
  }
}
