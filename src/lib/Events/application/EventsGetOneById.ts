import { Event } from '../domain/Event';
import { EventId } from '../domain/EventId';
import { EventRepository } from '../domain/EventRepository';

export class EventsGetOneById {
  constructor(private readonly repository: EventRepository) {}

  async run(id: string): Promise<Event | null> {
    return this.repository.findById(new EventId(id));
  }
}
