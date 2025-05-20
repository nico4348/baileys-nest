import { MessageStatus } from '../MessageEstatusEntity';
import { MessageStatusId } from './MessageStatusId';

export interface MessageStatusRepository {
  create(message: MessageStatus): Promise<MessageStatus>;
  getAll(): Promise<MessageStatus[]>;
  getById(id: MessageStatusId): Promise<MessageStatus | null>;
  update(message: MessageStatus): Promise<MessageStatus>;
  delete(id: MessageStatusId): Promise<void>;
  deleteAll(): Promise<void>;
}
