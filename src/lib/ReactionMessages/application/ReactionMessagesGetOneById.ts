import { ReactionMessage } from '../domain/ReactionMessage';
import { ReactionMessageId } from '../domain/ReactionMessageId';
import { ReactionMessageRepository } from '../domain/ReactionMessageRepository';

export class ReactionMessageGetOneById {
  constructor(private readonly repository: ReactionMessageRepository) {}

  async run(id: string): Promise<ReactionMessage | null> {
    return this.repository.getOneById(new ReactionMessageId(id));
  }
}
