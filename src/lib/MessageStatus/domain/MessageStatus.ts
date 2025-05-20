import { MessageStatusId } from './MessageStatusId';
import { MessageStatusMessageId } from './MessageStatusMessageId';
import { MessageStatusStatusId } from './MessageStatusStatusId';
import { MessageStatusUpdatedAt } from './MessageStatusUpdatedAt';

export class Message {
  id: MessageStatusId;
  message_id: MessageStatusMessageId;
  status_id: MessageStatusStatusId;
  updated_at: MessageStatusUpdatedAt;

  constructor(
    id: MessageStatusId,
    message_id: MessageStatusMessageId,
    status_id: MessageStatusStatusId,
    updated_at: MessageStatusUpdatedAt,
  ) {
    this.id = id;
    this.message_id = message_id;
    this.status_id = status_id;
    this.updated_at = updated_at;
  }
}
