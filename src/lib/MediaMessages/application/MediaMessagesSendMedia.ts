import { MediaMessagesCreate } from './MediaMessagesCreate';
import {
  BaileysMessageSender,
  MediaPayload,
} from '../../Messages/infrastructure/BaileysMessageSender';

import * as path from 'path';
import { lookup } from 'mime-types';

export class MediaMessagesSendMedia {
  constructor(
    private readonly mediaMessagesCreate: MediaMessagesCreate,
    private readonly messageSender: BaileysMessageSender,
  ) {}
  async run(
    sessionId: string,
    to: string,
    mediaType: string,
    mediaUrl: string,
    caption?: string,
    quotedMessageId?: string,
  ): Promise<{ mediaMessageId: string; success: boolean }> {
    try {
      // Extract file information first
      const fileName = path.basename(mediaUrl);
      const mimeType = lookup(mediaUrl) || 'application/octet-stream';

      const payload: MediaPayload = {
        url: mediaUrl,
        caption,
        media_type: mediaType,
        mime_type: mimeType,
        file_name: fileName,
        file_path: mediaUrl,
      }; // Send message through Baileys
      const sentMessage = await this.messageSender.sendMediaMessage(
        sessionId,
        `${to}@s.whatsapp.net`,
        mediaType,
        payload,
        quotedMessageId,
      );
      if (sentMessage && sentMessage.key && sentMessage.key.id) {
        // Use WhatsApp returned id as message id
        const mediaMessageId = sentMessage.key.id.toString();

        // Save media message to database using WhatsApp id
        await this.mediaMessagesCreate.run(
          mediaMessageId,
          mediaMessageId, // Use the same WhatsApp ID as both message ID and media message ID
          caption || null,
          mediaType,
          mimeType,
          fileName,
          mediaUrl,
        );

        return { mediaMessageId, success: true };
      } else {
        throw new Error(
          'Failed to send media message through WhatsApp or invalid message key',
        );
      }
    } catch (error) {
      console.error('Error sending media message:', error);
      throw error;
    }
  }
}
