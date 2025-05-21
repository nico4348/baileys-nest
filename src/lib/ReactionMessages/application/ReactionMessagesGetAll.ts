import { ReactionMessage } from '../domain/ReactionMessage';
import { ReactionMessageRepository } from '../domain/ReactionMessageRepository';

export class ReactionMessageGetAll {
  constructor(private readonly repository: ReactionMessageRepository) {}

  async run(): Promise<ReactionMessage[]> {
    return this.repository.getAll();
  }
}
