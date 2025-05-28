import { MessagesCreate } from './MessagesCreate';
import { BaileysMessageSender, MediaPayload } from '../infrastructure/BaileysMessageSender';
import { v4 as uuidv4 } from 'uuid';

export class MessagesSendMedia {
  constructor(
    private readonly messagesCreate: MessagesCreate,
    private readonly messageSender: BaileysMessageSender,
  ) {}

  async run(
    sessionId: string,
    to: string,
    mediaType: string,
    mediaUrl: string,
    caption?: string,
    quotedMessageId?: string,
  ): Promise<{ messageId: string; success: boolean }> {
    try {
      const messageId = uuidv4();
      const payload: MediaPayload = { url: mediaUrl, caption };

      // Send message through Baileys
      const sentMessage = await this.messageSender.sendMediaMessage(
        sessionId,
        to,
        mediaType,
        payload,
      );

      if (sentMessage) {
        // Save message to database
        await this.messagesCreate.run(
          messageId,
          'out',
          'media',
          quotedMessageId || null,
          sessionId,
          to,
          new Date(),
        );

        return { messageId, success: true };
      } else {
        throw new Error('Failed to send media message through WhatsApp');
      }
    } catch (error) {
      console.error('Error sending media message:', error);
      throw error;
    }
  }
}