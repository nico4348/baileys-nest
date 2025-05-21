import { EventLog } from '../domain/EventLog';
import { EventLogId } from './EventLogId';

export interface EventLogRepository {
  create(eventLog: EventLog): Promise<void>;
  getAll(): Promise<EventLog[]>;
  getOneById(id: EventLogId): Promise<EventLog | null>;
  update(eventLog: EventLog): Promise<void>;
  delete(id: EventLogId): Promise<void>;
}
