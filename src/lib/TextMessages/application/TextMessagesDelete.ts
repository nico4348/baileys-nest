import { TextMessageId } from '../domain/TextMessageId';
import { TextMessageRepository } from '../domain/TextMessageRepository';

export class TextMessagesDelete {
  constructor(private readonly repository: TextMessageRepository) {}

  async run(id: string): Promise<void> {
    return this.repository.delete(new TextMessageId(id));
  }
}
