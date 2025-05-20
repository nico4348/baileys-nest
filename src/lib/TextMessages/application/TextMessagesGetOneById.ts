import { TextMessage } from '../domain/TextMessage';
import { TextMessageId } from '../domain/TextMessageId';
import { TextMessageRepository } from '../domain/TextMessageRepository';

export class TextMessagesGetOneById {
  constructor(private readonly repository: TextMessageRepository) {}

  async run(id: string): Promise<TextMessage | null> {
    return this.repository.getOneById(new TextMessageId(id));
  }
}
