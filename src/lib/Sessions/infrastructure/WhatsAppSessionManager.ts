import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import { AuthStateFactory } from '../../AuthState/infrastructure/AuthStateFactory';
import { SessionsRepository } from '../domain/SessionsRepository';
import { WhatsAppSocketFactory } from './Socket';
import { SessionsUpdate } from '../application/SessionsUpdate';
import { SessionsGetOneById } from '../application/SessionsGetOneById';
import { SessionsDelete } from '../application/SessionsDelete';
import { Session } from '../domain/Session';
import { SessionQrService } from './SessionQrService';
import { SessionsStart } from '../application/SessionsStart';
import { SessionsResume } from '../application/SessionsResume';
import { SessionsRestart } from '../application/SessionsRestart';
import { SessionsStop } from '../application/SessionsStop';

@Injectable()
export class WhatsAppSessionManager implements OnModuleInit {
  private sessions: Map<string, any> = new Map();
  private restarting: Set<string> = new Set();
  private deleting: Set<string> = new Set();
  constructor(
    @Inject('AuthStateFactory')
    private readonly authStateFactory: AuthStateFactory,
    @Inject('SessionsRepository')
    private readonly sessionsRepository: SessionsRepository,
    @Inject('SessionsUpdate')
    private readonly sessionsUpdate: SessionsUpdate,
    @Inject('SessionsGetOneById')
    private readonly sessionsGetOneById: SessionsGetOneById,
    @Inject('SessionsDelete')
    private readonly sessionsDelete: SessionsDelete,
    private readonly sessionQrService: SessionQrService,
    private readonly sessionsStart: SessionsStart,
    private readonly sessionsResume: SessionsResume,
    private readonly sessionsRestart: SessionsRestart,
    private readonly sessionsStop: SessionsStop,
  ) {}

  async onModuleInit() {
    const allSessions: Session[] = await this.sessionsRepository.getAll();
    const activeSessions = allSessions.filter(
      (s) => s.status.value && !s.isDeleted.value,
    );
    for (const session of activeSessions) {
      await this.startSession(session.id.value);
    }
  }

  async startSession(sessionId: string): Promise<any> {
    await this.sessionsStart.run(sessionId);
    const existingSocket = this.sessions.get(sessionId);
    if (existingSocket && existingSocket.readyState === 1) {
      return existingSocket;
    }
    const socketFactory = new WhatsAppSocketFactory(
      this.authStateFactory,
      undefined,
      undefined,
      this,
    );
    this.sessionQrService.setSocketFactory(sessionId, socketFactory);
    const socket = await socketFactory.createSocket(sessionId);
    this.sessions.set(sessionId, socket);
    return socket;
  }

  async resumeSession(sessionId: string): Promise<any> {
    await this.sessionsResume.run(sessionId);
    const existingSocket = this.sessions.get(sessionId);
    if (existingSocket && existingSocket.readyState === 1) {
      return existingSocket;
    }
    return await this.startSession(sessionId);
  }

  async recreateSession(sessionId: string): Promise<any> {
    await this.sessionsRestart.run(sessionId);
    this.restarting.add(sessionId);
    try {
      const existingSocket = this.sessions.get(sessionId);
      if (existingSocket) {
        try {
          existingSocket.close();
        } catch (error) {}
        this.sessions.delete(sessionId);
      }
      this.sessionQrService.removeSocketFactory(sessionId);
      const result = await this.startSession(sessionId);
      setTimeout(() => {
        this.restarting.delete(sessionId);
      }, 5000);
      return result;
    } catch (error) {
      this.restarting.delete(sessionId);
      throw error;
    }
  }
  async stopSession(sessionId: string): Promise<void> {
    await this.sessionsStop.run(sessionId);
    const socket = this.sessions.get(sessionId);
    if (socket) {
      try {
        if (socket.end && typeof socket.end === 'function') {
          socket.end();
        }
      } catch (error) {
        console.warn(
          `Warning: Error stopping session ${sessionId}:`,
          error.message,
        );
      }
    }
  }
  async deleteSession(sessionId: string): Promise<void> {
    this.deleting.add(sessionId);
    try {
      const socket = this.sessions.get(sessionId);
      if (socket) {
        // Intentar logout con manejo de errores
        try {
          if (socket.logout && typeof socket.logout === 'function') {
            await socket.logout();
          }
        } catch (logoutError) {
          console.warn(
            `Warning: Error during logout for session ${sessionId}:`,
            logoutError.message,
          );
        }

        // Intentar cerrar la conexión con manejo de errores
        try {
          if (socket.end && typeof socket.end === 'function') {
            await socket.end();
          }
        } catch (endError) {
          console.warn(
            `Warning: Error during end for session ${sessionId}:`,
            endError.message,
          );
        }

        this.sessions.delete(sessionId);
      }

      this.sessionQrService.removeSocketFactory(sessionId);
      await this.sessionsDelete.run(sessionId);
    } catch (error) {
      console.error(`Error deleting session ${sessionId}:`, error.message);
      throw error;
    } finally {
      setTimeout(() => {
        this.deleting.delete(sessionId);
      }, 10000);
    }
  }

  // Session management methods
  isSessionRestarting(sessionId: string): boolean {
    return this.restarting.has(sessionId);
  }
  isSessionDeleting(sessionId: string): boolean {
    return this.deleting.has(sessionId);
  }

  async isSessionPaused(sessionId: string): Promise<boolean> {
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
}
