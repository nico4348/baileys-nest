import { ReactionMessageEmoji } from './ReactionMessageEmoji';
import { ReactionMessageId } from './ReactionMessageId';
import { ReactionMessageMessageId } from './ReactionMessageMessageId';
import { ReactionMessageTargetMsgId } from './ReactionMessageTargetMsgId';

export class ReactionMessage {
  id: ReactionMessageId;
  message_id: ReactionMessageMessageId;
  emoji: ReactionMessageEmoji;
  target_msg_id: ReactionMessageTargetMsgId;

  constructor(
    id: ReactionMessageId,
    message_id: ReactionMessageMessageId,
    emoji: ReactionMessageEmoji,
    target_msg_id: ReactionMessageTargetMsgId,
  ) {
    this.id = id;
    this.message_id = message_id;
    this.emoji = emoji;
    this.target_msg_id = target_msg_id;
  }
}
