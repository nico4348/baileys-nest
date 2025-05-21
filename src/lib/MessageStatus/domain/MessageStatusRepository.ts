import { MessageStatus } from './MessageStatus';
import { MessageStatusId } from './MessageStatusId';

export interface MessageStatusRepository {
  create(message: MessageStatus): Promise<MessageStatus>;
  getAll(): Promise<MessageStatus[]>;
  getOneById(id: MessageStatusId): Promise<MessageStatus | null>;
  update(message: MessageStatus): Promise<MessageStatus>;
  delete(id: MessageStatusId): Promise<void>;
}
