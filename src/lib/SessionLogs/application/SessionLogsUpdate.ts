import { Injectable, Inject } from '@nestjs/common';
import { SessionLog } from '../domain/SessionLog';
import { SessionLogCreatedAt } from '../domain/SessionLogCreatedAt';
import { SessionLogId } from '../domain/SessionLogId';
import { SessionLogLogType } from '../domain/SessionLogLogType';
import { SessionLogMessage } from '../domain/SessionLogMessage';
import { SessionLogRepository } from '../domain/SessionLogRepository';
import { SessionLogSessionId } from '../domain/SessionLogSessionId';

@Injectable()
export class SessionLogsUpdate {
  constructor(
    @Inject('SessionLogRepository')
    private readonly repository: SessionLogRepository,
  ) {}

  async run(
    id: string,
    sessionId: string,
    logType: string,
    message: string,
    createdAt: Date,
    metadata?: Record<string, any>,
  ): Promise<SessionLog> {
    try {
      const sessionLog = new SessionLog(
        new SessionLogId(id),
        new SessionLogSessionId(sessionId),
        new SessionLogLogType(logType),
        new SessionLogMessage(message),
        new SessionLogCreatedAt(createdAt),
        metadata,
      );

      return await this.repository.update(sessionLog);
    } catch (error) {
      throw new Error(`Failed to update session log: ${error.message}`);
    }
  }
}
