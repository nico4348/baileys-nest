import { EventLogRepository } from '../domain/EventLogRepository';
import { EventLogSessionId } from '../domain/EventLogSessionId';
import { EventLog } from '../domain/EventLog';

export class EventLogsGetBySessionId {
  constructor(private readonly repository: EventLogRepository) {}
  async run(sessionId: string): Promise<EventLog[]> {
    const sessionIdValue = new EventLogSessionId(sessionId);
    return this.repository.findBySessionId(sessionIdValue);
  }
}
