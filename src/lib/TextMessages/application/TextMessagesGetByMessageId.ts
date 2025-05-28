import { TextMessageRepository } from '../domain/TextMessageRepository';
import { TextMessage } from '../domain/TextMessage';

export class TextMessagesGetByMessageId {
  constructor(private readonly repository: TextMessageRepository) {}
  
  async run(messageId: string): Promise<TextMessage | null> {
    return this.repository.getByMessageId(messageId);
  }
}