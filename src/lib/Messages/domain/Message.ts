import { MessageCreatedAt } from './MessageCreatedAt';
import { MessageId } from './MessageId';
import { MessageMessageType } from './MessageMessageType';
import { MessageQuotedMessageId } from './MessageQuotedMessageId';
import { MessageSessionId } from './MessageSessionId';
import { MessageTo } from './MessageTo';
import { MessageBaileysJson } from './MessageBaileysJson';

export class Message {
  id: MessageId;
  baileys_json: MessageBaileysJson;
  session_id: MessageSessionId;
  quoted_message_id: MessageQuotedMessageId;
  to: MessageTo;
  message_type: MessageMessageType;
  created_at: MessageCreatedAt;

  constructor(
    id: MessageId,
    baileys_json: MessageBaileysJson,
    session_id: MessageSessionId,
    quoted_message_id: MessageQuotedMessageId,
    to: MessageTo,
    message_type: MessageMessageType,
    created_at: MessageCreatedAt,
  ) {
    this.id = id;
    this.baileys_json = baileys_json;
    this.session_id = session_id;
    this.quoted_message_id = quoted_message_id;
    this.to = to;
    this.message_type = message_type;
    this.created_at = created_at;
  }
}
