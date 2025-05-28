import { MessageId } from '../domain/MessageId';
import { MessageRepository } from '../domain/MessageRepository';

export class MessagesDelete {
  constructor(private readonly repository: MessageRepository) {}

  async run(id: string): Promise<void> {
    return this.repository.delete(new MessageId(id));
  }
}
