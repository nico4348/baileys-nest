import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { SessionsRepository } from '../domain/SessionsRepository';

@Injectable()
export class SessionsOnInit implements OnApplicationBootstrap {
  constructor(private readonly sessionsRepository: SessionsRepository) {}

  async onApplicationBootstrap() {
    const sessions = (await this.sessionsRepository.getAll()).map((session) =>
      session.toPlainObject(),
    );
    const activeSessions = sessions.filter((session) => !session.isDeleted);
    console.log('Sesiones activas al arrancar el servidor:', activeSessions);
  }
}
