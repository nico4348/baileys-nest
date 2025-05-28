import { ReactionMessage } from './ReactionMessage';
import { ReactionMessageId } from './ReactionMessageId';

export interface ReactionMessageRepository {
  create(reactionMessage: ReactionMessage): Promise<void>;
  getAll(): Promise<ReactionMessage[]>;
  getOneById(id: ReactionMessageId): Promise<ReactionMessage | null>;
  getByMessageId(messageId: string): Promise<ReactionMessage[]>;
  getByTargetMessageId(targetMessageId: string): Promise<ReactionMessage[]>;
  getBySessionId(sessionId: string): Promise<ReactionMessage[]>;
  getByEmoji(emoji: string): Promise<ReactionMessage[]>;
  update(reactionMessage: ReactionMessage): Promise<void>;
  delete(id: ReactionMessageId): Promise<void>;
  deleteByMessageId(messageId: string): Promise<void>;
}
