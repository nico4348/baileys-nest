import { EventRepository } from '../domain/EventRepository';
import { EventName } from '../domain/EventName';
import { Event } from '../domain/Event';

export class EventsGetOneByName {
  constructor(private readonly repository: EventRepository) {}
  async run(name: string): Promise<Event | null> {
    const eventName = new EventName(name);
    return this.repository.findByName(eventName);
  }
}