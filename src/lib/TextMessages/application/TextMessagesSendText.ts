import { TextMessagesCreate } from './TextMessagesCreate';
import {
  BaileysMessageSender,
  TextPayload,
} from '../../Messages/infrastructure/BaileysMessageSender';

export class TextMessagesSendText {
  constructor(
    private readonly textMessagesCreate: TextMessagesCreate,
    private readonly messageSender: BaileysMessageSender,
  ) {}
  async run(
    sessionId: string,
    to: string,
    text: string,
    quotedMessageId?: string,
  ): Promise<{ textMessageId: string; success: boolean }> {
    try {
      const payload: TextPayload = { text };

      // Send message through Baileys
      const sentMessage = await this.messageSender.sendTextMessage(
        sessionId,
        to,
        payload,
      );

      if (sentMessage && sentMessage.key && sentMessage.key.id) {
        // Use WhatsApp returned id as text message id
        const textMessageId = sentMessage.key.id.toString();
        // Save text message to database
        await this.textMessagesCreate.run(
          textMessageId,
          textMessageId, // Use same ID for both message and text message
          text,
        );

        return { textMessageId, success: true };
      } else {
        throw new Error(
          'Failed to send text message through WhatsApp or invalid message key',
        );
      }
    } catch (error) {
      console.error('Error sending text message:', error);
      throw error;
    }
  }
}
