import { Session } from './Session';
import { SessionId } from './SessionId';
import { SessionPhone } from './SessionPhone';

export interface SessionsRepository {
  create(session: Session): Promise<Session>;
  findAll(): Promise<Session[]>;
  findById(id: SessionId): Promise<Session | null>;
  findByPhone(phone: SessionPhone): Promise<Session | null>;
  update(session: Session): Promise<Session>;
  delete(id: SessionId): Promise<void>;
}
