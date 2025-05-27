import { Session } from './Session';
import { SessionDeletedAt } from './SessionDeletedAt';
import { SessionId } from './SessionId';
import { SessionPhone } from './SessionPhone';
import { SessionStatus } from './SessionStatus';
import { SessionIsDeleted } from './SessionIsDeleted';

export interface SessionsRepository {
  create(session: Session): Promise<void>;
  getAll(): Promise<Session[]>;
  getOneById(id: SessionId): Promise<Session | null>;
  getOneByPhone(phone: SessionPhone): Promise<Session | null>;
  getByPhone(phone: SessionPhone): Promise<Session[]>;
  getByStatus(status: SessionStatus): Promise<Session[]>;
  getByIsDeleted(isDeleted: SessionIsDeleted): Promise<Session[]>;
  getByCreatedAtRange(startDate: Date, endDate: Date): Promise<Session[]>;
  getByUpdatedAtRange(startDate: Date, endDate: Date): Promise<Session[]>;
  update(session: Session): Promise<Session>;
  hardDelete(id: SessionId): Promise<void>;
  softDelete(id: SessionId, deletedAt: SessionDeletedAt): Promise<void>;
}
