import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import { AuthStateFactory } from '../../AuthState/infraestructure/AuthStateFactory';
import { SessionsRepository } from '../domain/SessionsRepository';
import { WhatsAppSocketFactory } from './Socket';

@Injectable()
export class WhatsAppSessionManager implements OnModuleInit {
  private sessions: Map<string, any> = new Map(); // Almacena los sockets

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
    const socketFactory = new WhatsAppSocketFactory(this.authStateFactory);
    const socket = await socketFactory.createSocket(sessionId);
    this.sessions.set(sessionId, socket); // Ahora el manager almacena el socket
    return socket;
  }

  async deleteSession(sessionId: string) {
    const socket = this.sessions.get(sessionId);
    if (socket) {
      socket.close();
      this.sessions.delete(sessionId);
    }
  }
}
