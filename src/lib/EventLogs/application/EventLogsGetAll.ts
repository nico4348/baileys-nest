import { EventLog } from '../domain/EventLog';
import { EventLogRepository } from '../domain/EventLogRepository';

export class EventLogGetAll {
  constructor(private readonly repository: EventLogRepository) {}

  async run(): Promise<EventLog[]> {
    return this.repository.getAll();
  }
}
