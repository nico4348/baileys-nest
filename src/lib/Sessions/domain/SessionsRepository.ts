import { Session } from './Session';
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
  delete(id: SessionId): Promise<void>;
  softDelete(id: SessionId): Promise<void>;
}
