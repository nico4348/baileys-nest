import { Session } from './Session';
import { SessionId } from './SessionId';
import { SessionPhone } from './SessionPhone';
import { SessionStatus } from './SessionStatus';

export interface SessionsRepository {
  create(session: Session): Promise<Session>;
  getAll(): Promise<Session[]>;
  getById(id: SessionId): Promise<Session | null>;
  getByPhone(phone: SessionPhone): Promise<Session | null>;
  getByStatus(status: SessionStatus): Promise<Session[]>;
  update(session: Session): Promise<Session>;
  delete(id: SessionId): Promise<void>;
  deleteByPhone(phone: SessionPhone): Promise<void>;
  deleteAll(): Promise<void>;
}
