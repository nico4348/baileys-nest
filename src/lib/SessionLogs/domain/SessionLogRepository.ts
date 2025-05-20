import { SessionLog } from './SessionLog';
import { SessionLogId } from './SessionLogId';
import { SessionLogSessionId } from './SessionLogSessionId';

export interface SessionLogRepository {
  create(session: SessionLog): Promise<SessionLog>;
  getAll(): Promise<SessionLog[]>;
  getById(id: SessionLogId): Promise<SessionLog | null>;
  getBySessionId(sessionId: SessionLogSessionId): Promise<SessionLog[]>;
  update(session: SessionLog): Promise<SessionLog>;
  delete(id: SessionLogId): Promise<void>;
  deleteAll(): Promise<void>;
  deleteBySessionId(sessionId: SessionLogSessionId): Promise<void>;
}
