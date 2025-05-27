import { Injectable, Inject } from '@nestjs/common';
import { SessionLogRepository } from '../domain/SessionLogRepository';

@Injectable()
export class SessionLogsCleanup {
  constructor(
    @Inject('SessionLogRepository')
    private readonly repository: SessionLogRepository,
  ) {}

  async run(olderThanDays: number): Promise<number> {
    try {
      if (olderThanDays <= 0) {
        throw new Error('olderThanDays must be greater than 0');
      }

      if (olderThanDays < 7) {
        throw new Error('olderThanDays must be at least 7 days for safety');
      }

      return await this.repository.deleteOldLogs(olderThanDays);
    } catch (error) {
      throw new Error(`Failed to cleanup old session logs: ${error.message}`);
    }
  }
}
