import { ReactionMessageRepository } from '../domain/ReactionMessageRepository';
import { ReactionMessage } from '../domain/ReactionMessage';

export class ReactionMessagesGetByMessageId {
  constructor(private readonly repository: ReactionMessageRepository) {}
  
  async run(messageId: string): Promise<ReactionMessage[]> {
    return this.repository.getByMessageId(messageId);
  }
}