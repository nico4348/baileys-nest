import { MessageStatusId } from '../domain/MessageStatusId';
import { MessageStatusRepository } from '../domain/MessageStatusRepository';

export class MessageStatusDelete {
  constructor(private readonly repository: MessageStatusRepository) {}

  async run(id: string): Promise<void> {
    return this.repository.delete(new MessageStatusId(id));
  }
}
