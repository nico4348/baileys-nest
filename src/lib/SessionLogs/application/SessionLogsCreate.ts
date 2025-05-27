import { Injectable, Inject } from '@nestjs/common';
import { SessionLog } from '../domain/SessionLog';
import { SessionLogCreatedAt } from '../domain/SessionLogCreatedAt';
import { SessionLogId } from '../domain/SessionLogId';
import { SessionLogLogType } from '../domain/SessionLogLogType';
import { SessionLogMessage } from '../domain/SessionLogMessage';
import { SessionLogRepository } from '../domain/SessionLogRepository';
import { SessionLogSessionId } from '../domain/SessionLogSessionId';

@Injectable()
export class SessionLogsCreate {
  constructor(
    @Inject('SessionLogRepository')
    private readonly repository: SessionLogRepository,
  ) {}

  async run(
    sessionId: string,
    logType: string,
    message: string,
    metadata?: Record<string, any>,
  ): Promise<SessionLog> {
    try {
      const sessionLog = new SessionLog(
        SessionLogId.generate(),
        new SessionLogSessionId(sessionId),
        new SessionLogLogType(logType),
        new SessionLogMessage(message),
        SessionLogCreatedAt.now(),
        metadata,
      );

      return await this.repository.create(sessionLog);
    } catch (error) {
      throw new Error(`Failed to create session log: ${error.message}`);
    }
  }

  async runWithId(
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

      return await this.repository.create(sessionLog);
    } catch (error) {
      throw new Error(
        `Failed to create session log with specific id: ${error.message}`,
      );
    }
  }
}
