import { EventLogId } from '../domain/EventLogId';
import { EventLogRepository } from '../domain/EventLogRepository';

export class EventLogsDelete {
  constructor(private readonly repository: EventLogRepository) {}

  async run(id: string): Promise<void> {
    return this.repository.delete(new EventLogId(id));
  }
}
