import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { SessionsRepository } from '../domain/SessionsRepository';

@Injectable()
export class SessionsOnInit implements OnApplicationBootstrap {
  constructor(private readonly sessionsRepository: SessionsRepository) {}
  async onApplicationBootstrap() {
    const sessions = await this.sessionsRepository.getAll();
    const activeSessions = sessions.filter(
      (session) => session.status.value && !session.isDeleted.value,
    );
    console.log(
      'Sesiones activas al arrancar el servidor:',
      activeSessions.map((session) => session.toPlainObject()),
    );
  }
}
