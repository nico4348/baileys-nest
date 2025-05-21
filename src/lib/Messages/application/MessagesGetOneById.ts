import { Message } from '../domain/Message';
import { MessageId } from '../domain/MessageId';
import { MessageRepository } from '../domain/MessageRepository';

export class MessageGetOneById {
  constructor(private readonly repository: MessageRepository) {}

  async run(id: string): Promise<Message | null> {
    return this.repository.getOneById(new MessageId(id));
  }
}
