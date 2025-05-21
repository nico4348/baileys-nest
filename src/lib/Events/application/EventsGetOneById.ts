import { Event } from '../domain/Event';
import { EventId } from '../domain/EventId';
import { EventRepository } from '../domain/EventRepository';

export class EventGetOneById {
  constructor(private readonly repository: EventRepository) {}

  async run(id: string): Promise<Event | null> {
    return this.repository.getOneById(new EventId(id));
  }
}
