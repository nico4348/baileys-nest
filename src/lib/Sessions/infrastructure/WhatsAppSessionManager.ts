import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import { AuthStateFactory } from '../../AuthState/infrastructure/AuthStateFactory';
import { SessionsRepository } from '../domain/SessionsRepository';
import { WhatsAppSocketFactory } from './Socket';
import { SessionsUpdate } from '../application/SessionsUpdate';
import { SessionsGetOneById } from '../application/SessionsGetOneById';
import { SessionId } from '../domain/SessionId';

@Injectable()
export class WhatsAppSessionManager implements OnModuleInit {
  private sessions: Map<string, any> = new Map();

  constructor(
    @Inject('AuthStateFactory')
    private readonly authStateFactory: AuthStateFactory,
    @Inject('SessionsRepository')
    private readonly sessionsRepository: SessionsRepository,
    @Inject('SessionsUpdate')
    private readonly sessionsUpdate: SessionsUpdate,
    @Inject('SessionsGetOneById')
    private readonly sessionsGetOneById: SessionsGetOneById,
  ) {}

  async onModuleInit() {
    const allSessions = await this.sessionsRepository.getAll();
    const activeSessions = allSessions.filter(
      (s) => s.status.value && !s.isDeleted.value,
    );
    for (const session of activeSessions) {
      await this.startSession(session.id.value);
    }
  }
  async startSession(sessionId: string) {
    // Verificar si la sesión existe en BD y está activa
    const session = await this.sessionsGetOneById.run(sessionId);
    if (!session) {
      throw new Error(`Sesión ${sessionId} no encontrada en la base de datos`);
    }

    // Si ya existe un socket activo, no crear otro
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
  async resumeSession(sessionId: string) {
    // Cambiar status a true en la base de datos al reanudar
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
      );
    }

    // Verificar si existe una sesión activa
    const existingSocket = this.sessions.get(sessionId);
    if (existingSocket && existingSocket.readyState === 1) {
      // Ya está activa y conectada
      console.log(`▶️ Sesión ${sessionId} ya estaba activa`);
      return existingSocket;
    }

    // Si existe pero está cerrada, o no existe, crear nueva conexión
    console.log(`▶️ Reanudando sesión ${sessionId}`);
    return await this.startSession(sessionId);
  }

  async recreateSession(sessionId: string) {
    // Cerrar socket existente si existe
    const existingSocket = this.sessions.get(sessionId);
    if (existingSocket) {
      try {
        existingSocket.close();
      } catch (error) {
        // Error cerrando socket existente
      }
      this.sessions.delete(sessionId);
    }

    // Crear nueva sesión
    return await this.startSession(sessionId);
  }
  async stopSession(sessionId: string) {
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
  } // Método para verificar si una sesión está pausada (status = false en BD)
  async isSessionPaused(sessionId: string): Promise<boolean> {
    try {
      const session = await this.sessionsGetOneById.run(sessionId);
      return session ? !session.status.value : true; // Si no existe, consideramos pausada
    } catch (error) {
      console.error(`Error verificando estado de sesión ${sessionId}:`, error);
      return true; // En caso de error, consideramos pausada
    }
  }

  async deleteSession(sessionId: string) {
    const socket = this.sessions.get(sessionId);
    if (socket) {
      // Cerrar socket más agresivamente
      if (typeof socket.end === 'function') {
        socket.end();
      }
      if (typeof socket.close === 'function') {
        socket.close();
      }
      if (typeof socket.ws?.close === 'function') {
        socket.ws.close();
      }
      this.sessions.delete(sessionId);
    }
    console.log(`🗑️ Sesión ${sessionId} eliminada completamente`);
  }
}
