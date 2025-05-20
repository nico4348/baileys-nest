import { MessageStatus } from '../MessageEstatusEntity';
import { MessageStatusId } from './MessageStatusId';

export interface MessageStatusRepository {
  create(message: MessageStatus): Promise<MessageStatus>;
  findById(id: MessageStatusId): Promise<MessageStatus | null>;
  findByUserId(userId: string): Promise<MessageStatus[]>;
  update(message: MessageStatus): Promise<MessageStatus>;
  delete(id: MessageStatusId): Promise<void>;
}
