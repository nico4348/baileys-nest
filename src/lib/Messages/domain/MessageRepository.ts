import { Message } from './Message';
import { MessageId } from './MessageId';

export interface MessageRepository {
  create(message: Message): Promise<Message>;
  findById(id: MessageId): Promise<Message | null>;
  findByUserId(userId: string): Promise<Message[]>;
  update(message: Message): Promise<Message>;
  delete(id: MessageId): Promise<void>;
}
