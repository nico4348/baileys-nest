import { SessionId } from '../domain/SessionId';
import { SessionsRepository } from '../domain/SessionsRepository';

export class SessionsHardDelete {
  constructor(private readonly sessionsRepository: SessionsRepository) {}

  async run(sessionId: string): Promise<void> {
    await this.sessionsRepository.hardDelete(new SessionId(sessionId));
    console.log(`Sesión ${sessionId} eliminada permanentemente`);
  }
}
