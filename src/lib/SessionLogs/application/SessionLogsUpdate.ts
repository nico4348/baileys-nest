import { SessionLog } from '../domain/SessionLog';
import { SessionLogCreatedAt } from '../domain/SessionLogCreatedAt';
import { SessionLogId } from '../domain/SessionLogId';
import { SessionLogLogType } from '../domain/SessionLogLogType';
import { SessionLogMessage } from '../domain/SessionLogMessage';
import { SessionLogRepository } from '../domain/SessionLogRepository';
import { SessionLogSessionId } from '../domain/SessionLogSessionId';

export class SessionLogsUpdate {
  constructor(private readonly repository: SessionLogRepository) {}
  async run(
    id: string,
    sessionId: string,
    logType: string,
    message: string,
    createdAt: Date,
  ): Promise<void> {
    const sessionLog = new SessionLog(
      new SessionLogId(id),
      new SessionLogSessionId(sessionId),
      new SessionLogLogType(logType),
      new SessionLogMessage(message),
      new SessionLogCreatedAt(createdAt),
    );

    await this.repository.update(sessionLog);
  }
}
