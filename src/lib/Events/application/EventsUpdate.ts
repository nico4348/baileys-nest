import { Event } from '../domain/Event';
import { EventRepository } from '../domain/EventRepository';
import { EventName } from '../domain/EventName';
import { EventDescription } from '../domain/EventDescription';
import { EventCreatedAt } from '../domain/EventCreatedAt';
import { EventId } from '../domain/EventId';

export class EventsUpdate {
  constructor(private readonly repository: EventRepository) {}
  async run(
    id: string,
    eventName: string,
    description: string,
    createdAt: Date,
  ): Promise<void> {
    const event = new Event(
      new EventId(id),
      new EventName(eventName),
      new EventDescription(description),
      new EventCreatedAt(createdAt),
    );
    await this.repository.update(event);
  }
}
