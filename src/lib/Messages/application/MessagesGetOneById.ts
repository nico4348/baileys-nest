import { Message } from '../domain/Message';
import { MessageId } from '../domain/MessageId';
import { MessageRepository } from '../domain/MessageRepository';

export class MessagesGetOneById {
  constructor(private readonly repository: MessageRepository) {}

  async run(id: string): Promise<Message | null> {
    return this.repository.getOneById(new MessageId(id));
  }
}
