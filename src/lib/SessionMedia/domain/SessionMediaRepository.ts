import { SessionMedia } from './SessionMedia';
import { SessionMediaId } from './SessionMediaId';
import { SessionMediaSessionId } from './SessionMediaSessionId';

export interface SessionMediaRepository {
  create(sessionMedia: SessionMedia): Promise<SessionMedia>;
  findById(id: SessionMediaId): Promise<SessionMedia | null>;
  findBySessionId(sessionId: SessionMediaSessionId): Promise<SessionMedia[]>;
  findAll(): Promise<SessionMedia[]>;
  update(sessionMedia: SessionMedia): Promise<SessionMedia>;
  delete(id: SessionMediaId): Promise<void>;
}