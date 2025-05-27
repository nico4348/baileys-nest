import { Injectable, Inject } from '@nestjs/common';
import { SessionLog } from '../domain/SessionLog';
import { SessionLogRepository } from '../domain/SessionLogRepository';

@Injectable()
export class SessionLogsGetRecent {
  constructor(
    @Inject('SessionLogRepository')
    private readonly repository: SessionLogRepository,
  ) {}

  async run(limit: number = 100): Promise<SessionLog[]> {
    try {
      if (limit <= 0 || limit > 1000) {
        throw new Error('Limit must be between 1 and 1000');
      }

      return await this.repository.getRecent(limit);
    } catch (error) {
      throw new Error(`Failed to get recent session logs: ${error.message}`);
    }
  }
}
