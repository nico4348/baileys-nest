import { ReactionMessageRepository } from '../domain/ReactionMessageRepository';
import { ReactionMessage } from '../domain/ReactionMessage';

export class ReactionMessagesGetByTargetMessageId {
  constructor(private readonly repository: ReactionMessageRepository) {}
  
  async run(targetMessageId: string): Promise<ReactionMessage[]> {
    return this.repository.getByTargetMessageId(targetMessageId);
  }
}