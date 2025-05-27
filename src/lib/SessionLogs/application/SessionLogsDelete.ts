import { Injectable, Inject } from '@nestjs/common';
import { SessionLogId } from '../domain/SessionLogId';
import { SessionLogRepository } from '../domain/SessionLogRepository';

@Injectable()
export class SessionLogsDelete {
  constructor(
    @Inject('SessionLogRepository')
    private readonly repository: SessionLogRepository,
  ) {}

  async run(id: string): Promise<void> {
    try {
      const sessionLogId = new SessionLogId(id);
      await this.repository.delete(sessionLogId);
    } catch (error) {
      throw new Error(`Failed to delete session log: ${error.message}`);
    }
  }
}
