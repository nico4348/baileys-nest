import { MessagesCreate } from './MessagesCreate';
import {
  BaileysMessageSender,
  MediaPayload,
} from '../infrastructure/BaileysMessageSender';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import { lookup } from 'mime-types';

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
