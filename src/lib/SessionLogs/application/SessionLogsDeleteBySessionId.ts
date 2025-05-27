import { Injectable, Inject } from '@nestjs/common';
import { SessionLogRepository } from '../domain/SessionLogRepository';
import { SessionLogSessionId } from '../domain/SessionLogSessionId';

@Injectable()
export class SessionLogsDeleteBySessionId {
  constructor(
    @Inject('SessionLogRepository')
    private readonly repository: SessionLogRepository,
  ) {}

  async run(sessionId: string): Promise<void> {
    try {
      const sessionLogSessionId = new SessionLogSessionId(sessionId);
      await this.repository.deleteBySessionId(sessionLogSessionId);
    } catch (error) {
      throw new Error(
        `Failed to delete session logs by session id: ${error.message}`,
      );
    }
  }
}
