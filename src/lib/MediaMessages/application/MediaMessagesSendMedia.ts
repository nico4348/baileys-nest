import { MediaMessagesCreate } from './MediaMessagesCreate';
import { BaileysMessageSender, MediaPayload } from '../../Messages/infrastructure/BaileysMessageSender';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import { lookup } from 'mime-types';

export class MediaMessagesSendMedia {
  constructor(
    private readonly mediaMessagesCreate: MediaMessagesCreate,
    private readonly messageSender: BaileysMessageSender,
  ) {}

  async run(
    sessionId: string,
    messageId: string,
    to: string,
    mediaType: string,
    mediaUrl: string,
    caption?: string,
    quotedMessageId?: string,
  ): Promise<{ mediaMessageId: string; success: boolean }> {
    try {
      const mediaMessageId = uuidv4();
      const payload: MediaPayload = { url: mediaUrl, caption };

      // Send message through Baileys
      const sentMessage = await this.messageSender.sendMediaMessage(
        sessionId,
        to,
        mediaType,
        payload,
      );

      if (sentMessage) {
        // Extract file information
        const fileName = path.basename(mediaUrl);
        const mimeType = lookup(mediaUrl) || 'application/octet-stream';

        // Save media message to database
        await this.mediaMessagesCreate.run(
          mediaMessageId,
          messageId,
          caption || null,
          mediaType,
          mimeType,
          fileName,
          mediaUrl,
        );

        return { mediaMessageId, success: true };
      } else {
        throw new Error('Failed to send media message through WhatsApp');
      }
    } catch (error) {
      console.error('Error sending media message:', error);
      throw error;
    }
  }
}