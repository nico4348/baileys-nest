import { TextMessageMessageId } from './TextMessageMessageId';
import { TextMessageBody } from './TextMessageBody';

export class TextMessage {
  message_id: TextMessageMessageId;
  body: TextMessageBody;

  constructor(message_id: TextMessageMessageId, body: TextMessageBody) {
    this.message_id = message_id;
    this.body = body;
  }
}
