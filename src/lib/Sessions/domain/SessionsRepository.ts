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
  getByPhone(
    phone: SessionPhone,
    limit?: number,
    offset?: number,
  ): Promise<Session[]>;
  getByStatus(
    status: SessionStatus,
    limit?: number,
    offset?: number,
  ): Promise<Session[]>;
  getByIsDeleted(
    isDeleted: SessionIsDeleted,
    limit?: number,
    offset?: number,
  ): Promise<Session[]>;
  getByCreatedAtRange(
    startDate: Date,
    endDate: Date,
    limit?: number,
    offset?: number,
  ): Promise<Session[]>;
  getByUpdatedAtRange(
    startDate: Date,
    endDate: Date,
    limit?: number,
    offset?: number,
  ): Promise<Session[]>;
  update(session: Session): Promise<Session>;
  hardDelete(id: SessionId): Promise<void>;
  softDelete(id: SessionId, deletedAt: SessionDeletedAt): Promise<void>;
}
