import { EventLogId } from './EventLogId';
import { EventLogSessionId } from './EventLogSessionId';
import { EventLogEventId } from './EventLogEventId';
import { EventLogCreatedAt } from './EventLogCreatedAt';

export class EventLog {
  id: EventLogId;
  session_id: EventLogSessionId;
  event_id: EventLogEventId;
  created_at: EventLogCreatedAt;

  constructor(
    id: EventLogId,
    session_id: EventLogSessionId,
    event_id: EventLogEventId,
    created_at: EventLogCreatedAt,
  ) {
    this.id = id;
    this.session_id = session_id;
    this.event_id = event_id;
    this.created_at = created_at;
  }
}
