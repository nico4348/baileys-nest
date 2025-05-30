import { TextMessage } from '../domain/TextMessage';
import { TextMessageId } from '../domain/TextMessageId';
import { TextMessageBody } from '../domain/TextMessageBody';
import { TextMessageMessageId } from '../domain/TextMessageMessageId';
import { TextMessageRepository } from '../domain/TextMessageRepository';

export class TextMessagesCreate {
  constructor(private readonly repository: TextMessageRepository) {}
  async run(messageId: string, body: string): Promise<void> {
    const textMessage = new TextMessage(
      new TextMessageMessageId(messageId),
      new TextMessageBody(body),
    );

    await this.repository.create(textMessage);
  }
}
