import { MessageStatus } from '../domain/MessageStatus';
import { MessageStatusId } from '../domain/MessageStatusId';
import { MessageStatusRepository } from '../domain/MessageStatusRepository';

export class MessageStatusGetOneById {
  constructor(private readonly repository: MessageStatusRepository) {}

  async run(id: string): Promise<MessageStatus | null> {
    return this.repository.getOneById(new MessageStatusId(id));
  }
}
