import { Event } from './Event';
import { EventId } from './EventId';
import { EventName } from './EventName';

export interface EventRepository {
  save(event: Event): Promise<void>;
  findAll(): Promise<Event[]>;
  findById(id: EventId): Promise<Event | null>;
  findByName(name: EventName): Promise<Event | null>;
  update(event: Event): Promise<void>;
  delete(id: EventId): Promise<void>;
}
