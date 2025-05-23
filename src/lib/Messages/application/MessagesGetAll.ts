import { Message } from '../domain/Message';
import { MessageRepository } from '../domain/MessageRepository';

export class MessageGetAll {
  constructor(private readonly repository: MessageRepository) {}

  async run(): Promise<Message[]> {
    return this.repository.getAll();
  }
}
