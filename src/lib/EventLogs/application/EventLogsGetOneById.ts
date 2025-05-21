import { EventLog } from '../domain/EventLog';
import { EventLogId } from '../domain/EventLogId';
import { EventLogRepository } from '../domain/EventLogRepository';

export class EventLogGetOneById {
  constructor(private readonly repository: EventLogRepository) {}

  async run(id: string): Promise<EventLog | null> {
    return this.repository.getOneById(new EventLogId(id));
  }
}
