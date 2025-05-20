import { SessionLog } from './SessionLog';
import { SessionLogId } from './SessionLogId';

export interface SessionLogRepository {
  create(session: SessionLog): Promise<SessionLog>;
  findById(id: SessionLogId): Promise<SessionLog | null>;
  findByUserId(userId: string): Promise<SessionLog[]>;
  update(session: SessionLog): Promise<SessionLog>;
  delete(id: SessionLogId): Promise<void>;
}
