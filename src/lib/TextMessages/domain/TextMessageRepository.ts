import { TextMessage } from './TextMessage';
import { TextMessageId } from './TextMessageId';

export interface TextMessageRepository {
  create(textMessage: TextMessage): Promise<void>;
  getAll(): Promise<TextMessage[]>;
  getOneById(id: TextMessageId): Promise<TextMessage | null>;
  getByMessageId(messageId: string): Promise<TextMessage | null>;
  getBySessionId(sessionId: string): Promise<TextMessage[]>;
  update(textMessage: TextMessage): Promise<void>;
  delete(id: TextMessageId): Promise<void>;
  deleteByMessageId(messageId: string): Promise<void>;
}
