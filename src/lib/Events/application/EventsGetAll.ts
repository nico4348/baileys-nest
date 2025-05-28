import { Event } from '../domain/Event';
import { EventRepository } from '../domain/EventRepository';

export class EventsGetAll {
  constructor(private readonly repository: EventRepository) {}

  async run(): Promise<Event[]> {
    return this.repository.findAll();
  }
}
