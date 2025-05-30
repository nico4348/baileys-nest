import { ReactionMessageEmoji } from './ReactionMessageEmoji';
import { ReactionMessageMessageId } from './ReactionMessageMessageId';
import { ReactionMessageTargetMsgId } from './ReactionMessageTargetMsgId';

export class ReactionMessage {
  message_id: ReactionMessageMessageId;
  emoji: ReactionMessageEmoji;
  target_msg_id: ReactionMessageTargetMsgId;

  constructor(
    message_id: ReactionMessageMessageId,
    emoji: ReactionMessageEmoji,
    target_msg_id: ReactionMessageTargetMsgId,
  ) {
    this.message_id = message_id;
    this.emoji = emoji;
    this.target_msg_id = target_msg_id;
  }
}
