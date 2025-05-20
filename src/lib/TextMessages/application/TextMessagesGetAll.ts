import { TextMessage } from '../domain/TextMessage';
import { TextMessageRepository } from '../domain/TextMessageRepository';

export class TextMessagesGetAll {
  constructor(private readonly repository: TextMessageRepository) {}

  async run(): Promise<TextMessage[]> {
    return this.repository.getAll();
  }
}
