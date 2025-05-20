import { TextMessageId } from './TextMessageId';
import { TextMessageMessageId } from './TextMessageMessageId';
import { TextMessageBody } from './TextMessageBody';

export class TextMessage {
  id: TextMessageId;
  id_message: TextMessageMessageId;
  body: TextMessageBody;

  constructor(
    id: TextMessageId,
    id_message: TextMessageMessageId,
    body: TextMessageBody,
  ) {
    this.id = id;
    this.id_message = id_message;
    this.body = body;
  }
}
