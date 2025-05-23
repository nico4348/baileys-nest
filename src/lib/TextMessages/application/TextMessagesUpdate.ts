import { TextMessage } from '../domain/TextMessage';
import { TextMessageBody } from '../domain/TextMessageBody';
import { TextMessageId } from '../domain/TextMessageId';
import { TextMessageMessageId } from '../domain/TextMessageMessageId';
import { TextMessageRepository } from '../domain/TextMessageRepository';

export class TextMessagesUpdate {
  constructor(private repository: TextMessageRepository) {}

  async run(id: string, messageId: string, body: string): Promise<void> {
    const textMessage = new TextMessage(
      new TextMessageId(id),
      new TextMessageMessageId(messageId),
      new TextMessageBody(body),
    );
    await this.repository.update(textMessage);
  }
}
