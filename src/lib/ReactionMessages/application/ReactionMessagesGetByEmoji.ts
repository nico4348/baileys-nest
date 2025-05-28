import { ReactionMessageRepository } from '../domain/ReactionMessageRepository';
import { ReactionMessage } from '../domain/ReactionMessage';

export class ReactionMessagesGetByEmoji {
  constructor(private readonly repository: ReactionMessageRepository) {}
  
  async run(emoji: string): Promise<ReactionMessage[]> {
    return this.repository.getByEmoji(emoji);
  }
}