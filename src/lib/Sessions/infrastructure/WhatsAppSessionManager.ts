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
  private restarting: Set<string> = new Set(); // Flag para evitar reconexiones automáticas durante restart manual
  private deleting: Set<string> = new Set(); // Flag para evitar reconexiones automáticas durante eliminación
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
      undefined, // logger
      undefined, // retryCache
      this, // sessionManager reference
    );
    const socket = await socketFactory.createSocket(sessionId);
    this.sessions.set(sessionId, socket);
    console.log(`🚀 Sesión ${sessionId} iniciada exitosamente`);
    return socket;
  }
  async resumeSession(sessionId: string): Promise<any> {
    // Verificar si la sesión existe y no está soft-deleted
    await this.validateSessionNotDeleted(sessionId); // Cambiar status a true en la base de datos al reanudar
    const session = await this.sessionsGetOneById.run(sessionId);
    if (session) {
      await this.sessionsUpdate.run(
        session.id.value,
        session.sessionName.value,
        session.phone.value,
        true, // status = true para reanudar
        session.createdAt.value,
        new Date(), // updated_at
        session.isDeleted.value,
        session.deletedAt.value || undefined,
      );
    }

    // Verificar si existe una sesión activa
    const existingSocket = this.sessions.get(sessionId);
    if (existingSocket && existingSocket.readyState === 1) {
      // Ya está activa y conectada
      console.log(`▶️ Sesión ${sessionId} ya estaba activa`);
      return existingSocket;
    } // Si existe pero está cerrada, o no existe, crear nueva conexión
    console.log(`▶️ Reanudando sesión ${sessionId}`);
    return await this.startSession(sessionId);
  }
  async recreateSession(sessionId: string): Promise<any> {
    // Verificar si la sesión existe y no está soft-deleted
    await this.validateSessionNotDeleted(sessionId);

    // Marcar que estamos en proceso de restart manual
    this.restarting.add(sessionId);

    try {
      // Cerrar socket existente si existe
      const existingSocket = this.sessions.get(sessionId);
      if (existingSocket) {
        try {
          existingSocket.close();
        } catch (error) {
          // Error cerrando socket existente
        }
        this.sessions.delete(sessionId);
      } // Crear nueva sesión
      const result = await this.startSession(sessionId);

      // Esperar un momento antes de quitar el flag para evitar reconexiones inmediatas
      setTimeout(() => {
        this.restarting.delete(sessionId);
      }, 5000); // 5 segundos de gracia

      return result;
    } catch (error) {
      // Remover flag en caso de error
      this.restarting.delete(sessionId);
      throw error;
    }
  }
  async stopSession(sessionId: string): Promise<void> {
    // Verificar si la sesión existe y no está soft-deleted
    await this.validateSessionNotDeleted(sessionId);

    const socket = this.sessions.get(sessionId);
    if (socket) {
      try {
        // Cambiar status a false en la base de datos ANTES de cerrar el socket
        const session = await this.sessionsGetOneById.run(sessionId);
        if (session) {
          await this.sessionsUpdate.run(
            session.id.value,
            session.sessionName.value,
            session.phone.value,
            false, // status = false para pausar
            session.createdAt.value,
            new Date(), // updated_at
            session.isDeleted.value,
            session.deletedAt.value || undefined,
          );
        }

        // Cerrar el socket más agresivamente
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
      // No eliminamos del Map, solo cerramos la conexión
    }
  }
  async isSessionPaused(sessionId: string): Promise<boolean> {
    try {
      const session = await this.sessionsGetOneById.run(sessionId);
      if (!session) return true; // Si no existe, consideramos pausada
      if (session.isDeleted.value) return true; // Si está soft-deleted, consideramos pausada
      return !session.status.value; // Si no está activa, está pausada
    } catch (error) {
      console.error(`Error verificando estado de sesión ${sessionId}:`, error);
      return true; // En caso de error, consideramos pausada
    }
  }
  isSessionRestarting(sessionId: string): boolean {
    return this.restarting.has(sessionId);
  }
  isSessionDeleting(sessionId: string): boolean {
    return this.deleting.has(sessionId);
  }
  // Método auxiliar para validar que una sesión existe y no está soft-deleted
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
