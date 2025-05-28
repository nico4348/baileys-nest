import { EventLogRepository } from '../domain/EventLogRepository';
import { EventLogEventId } from '../domain/EventLogEventId';
import { EventLog } from '../domain/EventLog';

export class EventLogsGetByEventId {
  constructor(private readonly repository: EventLogRepository) {}
  async run(eventId: string): Promise<EventLog[]> {
    const eventIdValue = new EventLogEventId(eventId);
    return this.repository.findByEventId(eventIdValue);
  }
}
