import { EventLog } from '../domain/EventLog';
import { EventLogId } from './EventLogId';
import { EventLogEventId } from './EventLogEventId';
import { EventLogSessionId } from './EventLogSessionId';

export interface EventLogRepository {
  save(eventLog: EventLog): Promise<void>;
  findAll(): Promise<EventLog[]>;
  findById(id: EventLogId): Promise<EventLog | null>;
  findByEventId(eventId: EventLogEventId): Promise<EventLog[]>;
  findBySessionId(sessionId: EventLogSessionId): Promise<EventLog[]>;
  update(eventLog: EventLog): Promise<void>;
  delete(id: EventLogId): Promise<void>;
}
