import { Session } from './Session';
import { SessionDeletedAt } from './SessionDeletedAt';
import { SessionId } from './SessionId';
import { SessionPhone } from './SessionPhone';
import { SessionStatus } from './SessionStatus';

export interface SessionsRepository {
  create(session: Session): Promise<void>;
  getAll(): Promise<Session[]>;
  getOneById(id: SessionId): Promise<Session | null>;
  getOneByPhone(phone: SessionPhone): Promise<Session | null>;
  getByStatus(status: SessionStatus): Promise<Session[]>;
  update(session: Session): Promise<Session>;
  hardDelete(id: SessionId): Promise<void>;
  softDelete(id: SessionId, deletedAt: SessionDeletedAt): Promise<void>;
}
