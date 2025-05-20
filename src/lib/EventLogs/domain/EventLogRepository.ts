import { EventLog } from '../EventLogsEntity';
import { EventLogSessionId } from './EventLogSessionId';

export interface EventLogRepository {
  create(eventLog: EventLog): Promise<void>;
  getAll(): Promise<EventLog[]>;
  getOneById(id: EventLogSessionId): Promise<EventLog | null>;
  edit(eventLog: EventLog): Promise<void>;
  delete(id: EventLogSessionId): Promise<void>;
}
