import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import { AuthStateFactory } from '../../AuthState/infrastructure/AuthStateFactory';
import { SessionsRepository } from '../domain/SessionsRepository';
import { WhatsAppSocketFactory } from './Socket';
import { SessionsUpdate } from '../application/SessionsUpdate';
import { SessionsGetOneById } from '../application/SessionsGetOneById';
import { SessionSoftDelete } from '../application/SessionSoftDelete';
import { Session } from '../domain/Session';

@Injectable()
export class WhatsAppSessionManager implements OnModuleInit {
  private sessions: Map<string, any> = new Map();
  private restarting: Set<string> = new Set();
  private deleting: Set<string> = new Set();
  private socketFactories: Map<string, any> = new Map(); // Almacenar factories para acceder a QR

  constructor(
    @Inject('AuthStateFactory')
    private readonly authStateFactory: AuthStateFactory,
    @Inject('SessionsRepository')
    private readonly sessionsRepository: SessionsRepository,
    @Inject('SessionsUpdate')
    private readonly sessionsUpdate: SessionsUpdate,
    @Inject('SessionsGetOneById')
    private readonly sessionsGetOneById: SessionsGetOneById,
    @Inject('SessionSoftDelete')
    private readonly sessionSoftDelete: SessionSoftDelete,
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
    await this.validateSessionNotDeleted(sessionId);

    const existingSocket = this.sessions.get(sessionId);
    if (existingSocket && existingSocket.readyState === 1) {
      console.log(`🚀 Sesión ${sessionId} ya está activa`);
      return existingSocket;
    }

    const socketFactory = new WhatsAppSocketFactory(
      this.authStateFactory,
      undefined,
      undefined,
      this,
    );

    // Almacenar el factory para acceso posterior al QR
    this.socketFactories.set(sessionId, socketFactory);

    const socket = await socketFactory.createSocket(sessionId);
    this.sessions.set(sessionId, socket);
    console.log(`🚀 Sesión ${sessionId} iniciada exitosamente`);
    return socket;
  }
  async resumeSession(sessionId: string): Promise<any> {
    await this.validateSessionNotDeleted(sessionId);
    const session = await this.sessionsGetOneById.run(sessionId);
    if (session) {
      await this.sessionsUpdate.run(
        session.id.value,
        session.sessionName.value,
        session.phone.value,
        true,
        session.createdAt.value,
        new Date(),
        session.isDeleted.value,
        session.deletedAt.value || undefined,
      );
    }

    const existingSocket = this.sessions.get(sessionId);
    if (existingSocket && existingSocket.readyState === 1) {
      console.log(`▶️ Sesión ${sessionId} ya estaba activa`);
      return existingSocket;
    }
    console.log(`▶️ Reanudando sesión ${sessionId}`);
    return await this.startSession(sessionId);
  }
  async recreateSession(sessionId: string): Promise<any> {
    await this.validateSessionNotDeleted(sessionId);

    this.restarting.add(sessionId);
    try {
      const existingSocket = this.sessions.get(sessionId);
      if (existingSocket) {
        try {
          existingSocket.close();
        } catch (error) {}
        this.sessions.delete(sessionId);
      }

      // También limpiar el socketFactory anterior
      this.socketFactories.delete(sessionId);

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
    await this.validateSessionNotDeleted(sessionId);

    const socket = this.sessions.get(sessionId);
    if (socket) {
      try {
        const session = await this.sessionsGetOneById.run(sessionId);
        if (session) {
          await this.sessionsUpdate.run(
            session.id.value,
            session.sessionName.value,
            session.phone.value,
            false,
            session.createdAt.value,
            new Date(),
            session.isDeleted.value,
            session.deletedAt.value || undefined,
          );
        }

        if (typeof socket.end === 'function') {
          socket.end();
        }
        if (typeof socket.close === 'function') {
          socket.close();
        }
        if (typeof socket.ws?.close === 'function') {
          socket.ws.close();
        }

        console.log(`⏸️ Sesión ${sessionId} pausada y socket cerrado`);
      } catch (error) {
        console.error(`Error pausando sesión ${sessionId}:`, error);
      }
    }
  }
  async isSessionPaused(sessionId: string): Promise<boolean> {
    try {
      const session = await this.sessionsGetOneById.run(sessionId);
      if (!session) return true;
      if (session.isDeleted.value) return true;
      return !session.status.value;
    } catch (error) {
      console.error(`Error verificando estado de sesión ${sessionId}:`, error);
      return true;
    }
  }
  isSessionRestarting(sessionId: string): boolean {
    return this.restarting.has(sessionId);
  }
  isSessionDeleting(sessionId: string): boolean {
    return this.deleting.has(sessionId);
  }

  // Método para obtener el QR de una sesión
  getSessionQR(sessionId: string): string | null {
    const socketFactory = this.socketFactories.get(sessionId);
    if (socketFactory && socketFactory.getQR) {
      return socketFactory.getQR(sessionId);
    }
    return null;
  }
  // Método para verificar si hay QR disponible
  hasSessionQR(sessionId: string): boolean {
    const socketFactory = this.socketFactories.get(sessionId);
    if (socketFactory && socketFactory.hasQR) {
      return socketFactory.hasQR(sessionId);
    }
    return false;
  }

  // Método para obtener el QR como imagen base64
  async getSessionQRAsBase64(sessionId: string): Promise<string | null> {
    const socketFactory = this.socketFactories.get(sessionId);
    if (socketFactory && socketFactory.getQRAsBase64) {
      return await socketFactory.getQRAsBase64(sessionId);
    }
    return null;
  }

  private async validateSessionNotDeleted(sessionId: string): Promise<void> {
    const session = await this.sessionsGetOneById.run(sessionId);
    if (!session) {
      throw new Error(`Sesión ${sessionId} no encontrada en la base de datos`);
    }
    if (session.isDeleted.value) {
      throw new Error(
        `Sesión ${sessionId} ha sido eliminada y no está disponible`,
      );
    }
  }
  async deleteSession(sessionId: string): Promise<void> {
    this.deleting.add(sessionId);

    try {
      const socket = this.sessions.get(sessionId);
      if (socket) {
        await socket.logout();
        await socket.end();
        this.sessions.delete(sessionId);
      }

      // Limpiar el socketFactory también
      this.socketFactories.delete(sessionId);

      await this.sessionSoftDelete.run(sessionId, new Date());
      console.log(`🗑️ Sesión ${sessionId} SoftDeleteada`);
    } catch (error) {
      console.error(`Error al eliminar sesión ${sessionId}:`, error);
      throw error;
    } finally {
      // Mantener el flag durante un tiempo para evitar reconexiones inmediatas
      setTimeout(() => {
        this.deleting.delete(sessionId);
      }, 10000);
    }
  }
}
