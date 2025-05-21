import { EventId } from '../domain/EventId';
import { EventRepository } from '../domain/EventRepository';

export class EventDelete {
  constructor(private readonly repository: EventRepository) {}

  async run(id: string): Promise<void> {
    return this.repository.delete(new EventId(id));
  }
}
