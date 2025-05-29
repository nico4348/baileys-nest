import { ReactionMessagesCreate } from './ReactionMessagesCreate';
import {
  BaileysMessageSender,
  ReactPayload,
} from '../../Messages/infrastructure/BaileysMessageSender';

export class ReactionMessagesSendReaction {
  constructor(
    private readonly reactionMessagesCreate: ReactionMessagesCreate,
    private readonly messageSender: BaileysMessageSender,
  ) {}
  async run(
    sessionId: string,
    to: string,
    messageKey: any,
    emoji: string,
    targetMessageId: string,
  ): Promise<{ reactionMessageId: string; success: boolean }> {
    try {
      const payload: ReactPayload = { key: messageKey, emoji }; // Send reaction through Baileys
      const sentMessage = await this.messageSender.sendReactMessage(
        sessionId,
        `${to}@s.whatsapp.net`,
        payload,
      );

      if (sentMessage && sentMessage.key && sentMessage.key.id) {
        // Use WhatsApp returned id as reaction message id
        const reactionMessageId = sentMessage.key.id.toString(); // Save reaction message to database
        await this.reactionMessagesCreate.run(
          reactionMessageId,
          reactionMessageId, // Use the same WhatsApp ID as both message ID and reaction message ID
          emoji,
          targetMessageId,
        );

        return { reactionMessageId, success: true };
      } else {
        throw new Error(
          'Failed to send reaction through WhatsApp or invalid message key',
        );
      }
    } catch (error) {
      console.error('Error sending reaction:', error);
      throw error;
    }
  }
}
