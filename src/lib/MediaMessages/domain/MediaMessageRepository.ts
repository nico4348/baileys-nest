import { MediaMessage } from './MediaMessage';
import { MediaMessageId } from './MediaMessageId';

export interface MediaMessageRepository {
  create(mediaMessage: MediaMessage): Promise<void>;
  getAll(): Promise<MediaMessage[]>;
  getOneById(id: MediaMessageId): Promise<MediaMessage | null>;
  update(mediaMessage: MediaMessage): Promise<void>;
  delete(id: MediaMessageId): Promise<void>;
}
