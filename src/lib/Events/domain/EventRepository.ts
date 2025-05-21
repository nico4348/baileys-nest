import { Event } from './Event';
import { EventId } from './EventId';

export interface EventRepository {
  create(event: Event): Promise<void>;
  getAll(): Promise<Event[]>;
  getOneById(id: EventId): Promise<Event | null>;
  update(event: Event): Promise<void>;
  delete(id: EventId): Promise<void>;
}
