import { ReactionMessageEmoji } from '../domain/ReactionMessageEmoji';
import { ReactionMessageId } from '../domain/ReactionMessageId';
import { ReactionMessageMessageId } from '../domain/ReactionMessageMessageId';
import { ReactionMessageRepository } from '../domain/ReactionMessageRepository';
import { ReactionMessageTargetMsgId } from '../domain/ReactionMessageTargetMsgId';
import { ReactionMessage } from '../domain/ReactionMessage';

export class ReactionMessagesCreate {
  constructor(private readonly repository: ReactionMessageRepository) {}
  async run(
    messageId: string,
    emoji: string,
    targetMsgId: string,
  ): Promise<void> {
    const reactionMessage = new ReactionMessage(
      new ReactionMessageMessageId(messageId),
      new ReactionMessageEmoji(emoji),
      new ReactionMessageTargetMsgId(targetMsgId),
    );

    await this.repository.create(reactionMessage);
  }
}
