import { MessagesCreate } from './MessagesCreate';
import { BaileysMessageSender, ReactPayload } from '../infrastructure/BaileysMessageSender';
import { v4 as uuidv4 } from 'uuid';

export class MessagesSendReaction {
  constructor(
    private readonly messagesCreate: MessagesCreate,
    private readonly messageSender: BaileysMessageSender,
  ) {}

  async run(
    sessionId: string,
    to: string,
    messageKey: any,
    emoji: string,
    targetMessageId: string,
  ): Promise<{ messageId: string; success: boolean }> {
    try {
      const messageId = uuidv4();
      const payload: ReactPayload = { key: messageKey, emoji };

      // Send reaction through Baileys
      const sentMessage = await this.messageSender.sendReactMessage(
        sessionId,
        to,
        payload,
      );

      if (sentMessage) {
        // Save message to database
        await this.messagesCreate.run(
          messageId,
          'out',
          'react',
          targetMessageId,
          sessionId,
          to,
          new Date(),
        );

        return { messageId, success: true };
      } else {
        throw new Error('Failed to send reaction through WhatsApp');
      }
    } catch (error) {
      console.error('Error sending reaction:', error);
      throw error;
    }
  }
}