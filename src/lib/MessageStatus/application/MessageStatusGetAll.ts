import { MessageStatus } from '../domain/MessageStatus';
import { MessageStatusRepository } from '../domain/MessageStatusRepository';

export class MessageStatusGetAll {
  constructor(private readonly repository: MessageStatusRepository) {}

  async run(): Promise<MessageStatus[]> {
    return this.repository.getAll();
  }
}
