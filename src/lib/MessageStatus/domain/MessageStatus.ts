import { MessageStatusId } from './MessageStatusId';
import { MessageStatusMessageId } from './MessageStatusMessageId';
import { MessageStatusStatusId } from './MessageStatusStatusId';
import { MessageStatusCreatedAt } from './MessageStatusCreatedAt';

export class MessageStatus {
  id: MessageStatusId;
  message_id: MessageStatusMessageId;
  status_id: MessageStatusStatusId;
  created_at: MessageStatusCreatedAt;

  constructor(
    id: MessageStatusId,
    message_id: MessageStatusMessageId,
    status_id: MessageStatusStatusId,
    created_at: MessageStatusCreatedAt,
  ) {
    this.id = id;
    this.message_id = message_id;
    this.status_id = status_id;
    this.created_at = created_at;
  }
}
