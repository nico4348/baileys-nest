import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import { AuthStateFactory } from '../../AuthState/infrastructure/AuthStateFactory';
import { SessionsRepository } from '../domain/SessionsRepository';
import { WhatsAppSocketFactory } from './Socket';

@Injectable()
export class WhatsAppSessionManager implements OnModuleInit {
  private sessions: Map<string, any> = new Map();

  constructor(
    @Inject('AuthStateFactory')
    private readonly authStateFactory: AuthStateFactory,
    @Inject('SessionsRepository')
    private readonly sessionsRepository: SessionsRepository,
  ) {}

  async onModuleInit() {
    const allSessions = await this.sessionsRepository.getAll();
    const activeSessions = allSessions.filter(
      (s) => s.status.value && !s.isDeleted.value,
    );
    for (const session of activeSessions) {
      await this.createSession(session.id.value);
    }
  }
  async createSession(sessionId: string) {
    const socketFactory = new WhatsAppSocketFactory(
      this.authStateFactory,
      undefined, // logger
      undefined, // retryCache
      this, // sessionManager reference
    );
    const socket = await socketFactory.createSocket(sessionId);
    this.sessions.set(sessionId, socket); // Ahora el manager almacena el socket
    return socket;
  }

  async recreateSession(sessionId: string) {
    console.log(`[${sessionId}] 🔄 Recreando sesión...`);

    // Cerrar socket existente si existe
    const existingSocket = this.sessions.get(sessionId);
    if (existingSocket) {
      try {
        existingSocket.close();
      } catch (error) {
        console.warn(
          `[${sessionId}] ⚠️ Error cerrando socket existente:`,
          error,
        );
      }
      this.sessions.delete(sessionId);
    }

    // Crear nueva sesión
    return await this.createSession(sessionId);
  }

  async deleteSession(sessionId: string) {
    const socket = this.sessions.get(sessionId);
    if (socket) {
      socket.close();
      this.sessions.delete(sessionId);
    }
  }
}
