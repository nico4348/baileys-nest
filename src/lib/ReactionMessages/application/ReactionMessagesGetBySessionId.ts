import { ReactionMessageRepository } from '../domain/ReactionMessageRepository';
import { ReactionMessage } from '../domain/ReactionMessage';

export class ReactionMessagesGetBySessionId {
  constructor(private readonly repository: ReactionMessageRepository) {}
  
  async run(sessionId: string): Promise<ReactionMessage[]> {
    return this.repository.getBySessionId(sessionId);
  }
}