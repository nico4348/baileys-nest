import { EventId } from './EventId';
import { EventName } from './EventName';
import { EventDescription } from './EventDescription';
import { EventCreatedAt } from './EventCreatedAt';

export class Event {
  id: EventId;
  event_name: EventName;
  description: EventDescription;
  created_at: EventCreatedAt;

  constructor(
    id: EventId,
    event_name: EventName,
    description: EventDescription,
    created_at: EventCreatedAt,
  ) {
    this.id = id;
    this.event_name = event_name;
    this.description = description;
    this.created_at = created_at;
  }
}
