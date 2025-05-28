import { ReactionMessagesCreate } from './ReactionMessagesCreate';
import { BaileysMessageSender, ReactPayload } from '../../Messages/infrastructure/BaileysMessageSender';
import { v4 as uuidv4 } from 'uuid';

export class ReactionMessagesSendReaction {
  constructor(
    private readonly reactionMessagesCreate: ReactionMessagesCreate,
    private readonly messageSender: BaileysMessageSender,
  ) {}

  async run(
    sessionId: string,
    messageId: string,
    to: string,
    messageKey: any,
    emoji: string,
    targetMessageId: string,
  ): Promise<{ reactionMessageId: string; success: boolean }> {
    try {
      const reactionMessageId = uuidv4();
      const payload: ReactPayload = { key: messageKey, emoji };

      // Send reaction through Baileys
      const sentMessage = await this.messageSender.sendReactMessage(
        sessionId,
        to,
        payload,
      );

      if (sentMessage) {
        // Save reaction message to database
        await this.reactionMessagesCreate.run(
          reactionMessageId,
          messageId,
          emoji,
          targetMessageId,
        );

        return { reactionMessageId, success: true };
      } else {
        throw new Error('Failed to send reaction through WhatsApp');
      }
    } catch (error) {
      console.error('Error sending reaction:', error);
      throw error;
    }
  }
}