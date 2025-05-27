import { SessionLog } from './SessionLog';
import { SessionLogId } from './SessionLogId';
import { SessionLogSessionId } from './SessionLogSessionId';
import { SessionLogLogType } from './SessionLogLogType';

export interface SessionLogRepository {
  create(sessionLog: SessionLog): Promise<SessionLog>;
  getAll(): Promise<SessionLog[]>;
  getOneById(id: SessionLogId): Promise<SessionLog | null>;
  getBySessionId(sessionId: SessionLogSessionId): Promise<SessionLog[]>;
  getBySessionIdAndType(sessionId: SessionLogSessionId, logType: SessionLogLogType): Promise<SessionLog[]>;
  getRecent(limit?: number): Promise<SessionLog[]>;
  update(sessionLog: SessionLog): Promise<SessionLog>;
  delete(id: SessionLogId): Promise<void>;
  deleteBySessionId(sessionId: SessionLogSessionId): Promise<void>;
  deleteOldLogs(olderThanDays: number): Promise<number>;
}
