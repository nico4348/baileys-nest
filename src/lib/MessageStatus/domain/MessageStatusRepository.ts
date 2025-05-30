import { MessageStatus } from './MessageStatus';
import { MessageStatusId } from './MessageStatusId';
import { MessageStatusMessageId } from './MessageStatusMessageId';

export interface MessageStatusRepository {
  save(message: MessageStatus): Promise<void>;
  findAll(): Promise<MessageStatus[]>;
  findById(id: MessageStatusId): Promise<MessageStatus | null>;
  findByMessageId(messageId: MessageStatusMessageId): Promise<MessageStatus[]>;
  findLatestByMessageId(messageId: MessageStatusMessageId): Promise<MessageStatus | null>;
  delete(id: MessageStatusId): Promise<void>;
}
