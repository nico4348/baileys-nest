import { Injectable, Inject } from '@nestjs/common';
import { SessionMediaRepository } from '../domain/SessionMediaRepository';
import { SessionMedia } from '../domain/SessionMedia';
import { SessionMediaSessionId } from '../domain/SessionMediaSessionId';

@Injectable()
export class SessionMediaGetBySessionId {
  constructor(@Inject('SessionMediaRepository') private readonly repository: SessionMediaRepository) {}

  async execute(sessionId: string): Promise<SessionMedia[]> {
    const sessionMediaSessionId = new SessionMediaSessionId(sessionId);
    return await this.repository.findBySessionId(sessionMediaSessionId);
  }
}