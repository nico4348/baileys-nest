import { MessagesCreate } from './MessagesCreate';
import { TextMessagesSendText } from '../../TextMessages/application/TextMessagesSendText';
import { MediaMessagesSendMedia } from '../../MediaMessages/application/MediaMessagesSendMedia';
import { ReactionMessagesSendReaction } from '../../ReactionMessages/application/ReactionMessagesSendReaction';
import { TextMessagesCreate } from '../../TextMessages/application/TextMessagesCreate';
import { MediaMessagesCreate } from '../../MediaMessages/application/MediaMessagesCreate';
import { ReactionMessagesCreate } from '../../ReactionMessages/application/ReactionMessagesCreate';
import {
  BaileysMessageSender,
  TextPayload,
  MediaPayload,
  ReactPayload,
} from '../infrastructure/BaileysMessageSender';
import * as path from 'path';
import { lookup } from 'mime-types';
import * as crypto from 'crypto';

export class MessagesOrchestrator {
  constructor(
    private readonly messagesCreate: MessagesCreate,
    private readonly textMessagesSendText: TextMessagesSendText,
    private readonly mediaMessagesSendMedia: MediaMessagesSendMedia,
    private readonly reactionMessagesSendReaction: ReactionMessagesSendReaction,
    private readonly textMessagesCreate: TextMessagesCreate,
    private readonly mediaMessagesCreate: MediaMessagesCreate,
    private readonly reactionMessagesCreate: ReactionMessagesCreate,
    private readonly messageSender: BaileysMessageSender,
  ) {}
  async sendTextMessage(
    sessionId: string,
    to: string,
    text: string,
    quotedMessageId?: string,
  ): Promise<{ messageId: string; textMessageId: string; success: boolean }> {
    try {
      const payload: TextPayload = {
        text,
      };
      const sentMessage = await this.messageSender.sendTextMessage(
        sessionId,
        `${to}@s.whatsapp.net`,
        payload,
        quotedMessageId,
      );

      if (!sentMessage || !sentMessage.key || !sentMessage.key.id) {
        throw new Error(
          'Failed to send text message through WhatsApp or invalid message key',
        );
      }

      const whatsappMessageId = sentMessage.key.id.toString();
      await this.messagesCreate.run(
        whatsappMessageId,
        'out',
        'txt',
        quotedMessageId || null,
        sessionId,
        to,
        new Date(),
      );

      await this.textMessagesCreate.run(
        crypto.randomUUID(),
        whatsappMessageId,
        text,
      );

      return {
        messageId: whatsappMessageId,
        textMessageId: whatsappMessageId,
        success: true,
      };
    } catch (error) {
      console.error('Error in sendTextMessage orchestration:', error);
      throw error;
    }
  }
  async sendMediaMessage(
    sessionId: string,
    to: string,
    mediaType: string,
    mediaUrl: string,
    caption?: string,
    quotedMessageId?: string,
  ): Promise<{ messageId: string; mediaMessageId: string; success: boolean }> {
    try {
      // Extract file information first
      const fileName = path.basename(mediaUrl);
      const mimeType = lookup(mediaUrl) || 'application/octet-stream';

      // 1. Send message through Baileys first to get WhatsApp message ID
      const payload: MediaPayload = {
        url: mediaUrl,
        caption,
        mime_type: mimeType,
        file_name: fileName,
        file_path: mediaUrl,
      };
      const sentMessage = await this.messageSender.sendMediaMessage(
        sessionId,
        `${to}@s.whatsapp.net`,
        mediaType,
        payload,
        quotedMessageId,
      );

      if (!sentMessage || !sentMessage.key || !sentMessage.key.id) {
        throw new Error(
          'Failed to send media message through WhatsApp or invalid message key',
        );
      }

      const whatsappMessageId = sentMessage.key.id.toString();

      // 2. Create base message record first (parent record)
      await this.messagesCreate.run(
        whatsappMessageId, // Use WhatsApp message ID
        'out',
        'media',
        quotedMessageId || null,
        sessionId,
        to,
        new Date(),
      ); // 3. Create media message record (child record)
      // Use the file information extracted earlier
      await this.mediaMessagesCreate.run(
        crypto.randomUUID(),
        whatsappMessageId,
        caption || null,
        mediaType,
        mimeType,
        fileName,
        mediaUrl,
      );

      return {
        messageId: whatsappMessageId,
        mediaMessageId: whatsappMessageId,
        success: true,
      };
    } catch (error) {
      console.error('Error in sendMediaMessage orchestration:', error);
      throw error;
    }
  }
  async sendReaction(
    sessionId: string,
    to: string,
    messageKey: any,
    emoji: string,
    targetMessageId: string,
  ): Promise<{
    messageId: string;
    reactionMessageId: string;
    success: boolean;
  }> {
    try {
      // 1. Send reaction through Baileys first to get WhatsApp message ID
      const payload: ReactPayload = { key: messageKey, emoji };
      const sentMessage = await this.messageSender.sendReactMessage(
        sessionId,
        to,
        payload,
      );

      if (!sentMessage || !sentMessage.key || !sentMessage.key.id) {
        throw new Error(
          'Failed to send reaction through WhatsApp or invalid message key',
        );
      }

      const whatsappMessageId = sentMessage.key.id.toString();

      // 2. Create base message record first (parent record)
      await this.messagesCreate.run(
        whatsappMessageId, // Use WhatsApp message ID
        'out',
        'react',
        targetMessageId,
        sessionId,
        to,
        new Date(),
      ); // 3. Create reaction message record (child record)
      await this.reactionMessagesCreate.run(
        crypto.randomUUID(),
        whatsappMessageId,
        emoji,
        targetMessageId,
      );

      return {
        messageId: whatsappMessageId,
        reactionMessageId: whatsappMessageId,
        success: true,
      };
    } catch (error) {
      console.error('Error in sendReaction orchestration:', error);
      throw error;
    }
  }
}
