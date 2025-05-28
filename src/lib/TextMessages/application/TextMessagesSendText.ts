import { TextMessagesCreate } from './TextMessagesCreate';
import { BaileysMessageSender, TextPayload } from '../../Messages/infrastructure/BaileysMessageSender';
import { v4 as uuidv4 } from 'uuid';

export class TextMessagesSendText {
  constructor(
    private readonly textMessagesCreate: TextMessagesCreate,
    private readonly messageSender: BaileysMessageSender,
  ) {}

  async run(
    sessionId: string,
    messageId: string,
    to: string,
    text: string,
    quotedMessageId?: string,
  ): Promise<{ textMessageId: string; success: boolean }> {
    try {
      const textMessageId = uuidv4();
      const payload: TextPayload = { text };

      // Send message through Baileys
      const sentMessage = await this.messageSender.sendTextMessage(
        sessionId,
        to,
        payload,
      );

      if (sentMessage) {
        // Save text message to database
        await this.textMessagesCreate.run(
          textMessageId,
          messageId,
          text,
        );

        return { textMessageId, success: true };
      } else {
        throw new Error('Failed to send text message through WhatsApp');
      }
    } catch (error) {
      console.error('Error sending text message:', error);
      throw error;
    }
  }
}