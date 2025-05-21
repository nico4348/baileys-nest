import { ReactionMessageId } from '../domain/ReactionMessageId';
import { ReactionMessageRepository } from '../domain/ReactionMessageRepository';

export class ReactionMessageDelete {
  constructor(private readonly repository: ReactionMessageRepository) {}

  async run(id: string): Promise<void> {
    return this.repository.delete(new ReactionMessageId(id));
  }
}
