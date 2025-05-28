import { MediaMessage } from './MediaMessage';
import { MediaMessageId } from './MediaMessageId';

export interface MediaMessageRepository {
  create(mediaMessage: MediaMessage): Promise<void>;
  getAll(): Promise<MediaMessage[]>;
  getOneById(id: MediaMessageId): Promise<MediaMessage | null>;
  getByMessageId(messageId: string): Promise<MediaMessage | null>;
  getBySessionId(sessionId: string): Promise<MediaMessage[]>;
  getByMediaType(mediaType: string): Promise<MediaMessage[]>;
  update(mediaMessage: MediaMessage): Promise<void>;
  delete(id: MediaMessageId): Promise<void>;
  deleteByMessageId(messageId: string): Promise<void>;
}
