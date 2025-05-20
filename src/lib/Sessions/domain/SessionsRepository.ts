import { Session } from './Session';
import { SessionId } from './SessionId';

export interface SessionsRepository {
  create(session: Session): Promise<Session>;
  findById(id: SessionId): Promise<Session | null>;
  findByUserId(userId: string): Promise<Session[]>;
  update(session: Session): Promise<Session>;
  delete(id: SessionId): Promise<void>;
}
