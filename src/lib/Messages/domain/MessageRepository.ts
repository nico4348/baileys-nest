import { Message } from './Message';
import { MessageId } from './MessageId';
import { MessageSessionId } from './MessageSessionId';

export interface MessageRepository {
  create(message: Message): Promise<Message>;
  getAll(): Promise<Message[]>;
  getOneById(id: MessageId): Promise<Message | null>;
  getBySessionId(sessionId: string): Promise<Message[]>;
  findByBaileysId(baileysMessageId: string, sessionId: MessageSessionId): Promise<Message | null>;
  update(message: Message): Promise<Message>;
  delete(id: MessageId): Promise<void>;
}
