import { ReactionMessage } from './ReactionMessage';
import { ReactionMessageId } from './ReactionMessageId';

export interface ReactionMessageRepository {
  create(reactionMessage: ReactionMessage): Promise<void>;
  getAll(): Promise<ReactionMessage[]>;
  getOneById(id: ReactionMessageId): Promise<ReactionMessage | null>;
  update(reactionMessage: ReactionMessage): Promise<void>;
  delete(id: ReactionMessageId): Promise<void>;
}
