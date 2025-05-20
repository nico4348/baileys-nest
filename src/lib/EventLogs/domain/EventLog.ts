import { EventLogId } from './EventLogId';
import { EventLogSessionId } from './EventLogSessionId';
import { EventLogEventId } from './EventLogEventId';
import { EventLogCreatedAt } from './EventLogCreatedAt';

export class EventLog {
  id: EventLogId;
  sessionId: EventLogSessionId;
  eventId: EventLogEventId;
  createdAt: EventLogCreatedAt;

  constructor(
    id: EventLogId,
    sessionId: EventLogSessionId,
    eventId: EventLogEventId,
    createdAt: EventLogCreatedAt,
  ) {
    this.id = id;
    this.sessionId = sessionId;
    this.eventId = eventId;
    this.createdAt = createdAt;
  }
}
