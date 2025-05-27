import { Injectable, Inject } from '@nestjs/common';
import { SessionLog } from '../domain/SessionLog';
import { SessionLogRepository } from '../domain/SessionLogRepository';
import { SessionLogSessionId } from '../domain/SessionLogSessionId';
import { SessionLogLogType } from '../domain/SessionLogLogType';

@Injectable()
export class SessionLogsGetBySessionIdAndType {
  constructor(
    @Inject('SessionLogRepository')
    private readonly repository: SessionLogRepository,
  ) {}

  async run(sessionId: string, logType: string): Promise<SessionLog[]> {
    try {
      const sessionLogSessionId = new SessionLogSessionId(sessionId);
      const sessionLogLogType = new SessionLogLogType(logType);

      return await this.repository.getBySessionIdAndType(
        sessionLogSessionId,
        sessionLogLogType,
      );
    } catch (error) {
      throw new Error(
        `Failed to get session logs by session id and type: ${error.message}`,
      );
    }
  }
}
