import { MessageId } from './MessageId';
import { MessageInOut } from './MessageInOut';
import { MessageMessageType } from './MessageMessageType';
import { MessageQuotedMessageId } from './MessageQuotedMessageId';
import { MessageSessionId } from './MessageSessionId';
import { MessageTo } from './MessageTo';

export class Message {
  id: MessageId;
  session_id: MessageSessionId;
  quoted_message_id: MessageQuotedMessageId;
  to: MessageTo;
  message_type: MessageMessageType;
  in_out: MessageInOut;
  created_at: Date;

  constructor(
    id: MessageId,
    session_id: MessageSessionId,
    quoted_message_id: MessageQuotedMessageId,
    to: MessageTo,
    message_type: MessageMessageType,
    in_out: MessageInOut,
    created_at: Date,
  ) {
    this.id = id;
    this.session_id = session_id;
    this.quoted_message_id = quoted_message_id;
    this.to = to;
    this.message_type = message_type;
    this.in_out = in_out;
    this.created_at = created_at;
  }
}
