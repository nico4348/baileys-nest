import { Message } from './Message';
import { MessageId } from './MessageId';

export interface MessageRepository {
  create(message: Message): Promise<Message>;
  getAll(): Promise<Message[]>;
  getOneById(id: MessageId): Promise<Message | null>;
  getBySessionId(sessionId: string): Promise<Message[]>;
  update(message: Message): Promise<Message>;
  delete(id: MessageId): Promise<void>;
}
