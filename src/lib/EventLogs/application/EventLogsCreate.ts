import { EventLog } from '../domain/EventLog';
import { EventLogCreatedAt } from '../domain/EventLogCreatedAt';
import { EventLogEventId } from '../domain/EventLogEventId';
import { EventLogId } from '../domain/EventLogId';
import { EventLogRepository } from '../domain/EventLogRepository';
import { EventLogSessionId } from '../domain/EventLogSessionId';

export class EventLogsCreate {
  constructor(private readonly repository: EventLogRepository) {}
  async run(
    id: string,
    sessionId: string,
    eventId: string,
    createdAt: Date,
  ): Promise<void> {
    const eventLog = new EventLog(
      new EventLogId(id),
      new EventLogSessionId(sessionId),
      new EventLogEventId(eventId),
      new EventLogCreatedAt(createdAt),
    );
    await this.repository.create(eventLog);
  }
}
