import { Injectable, Inject } from '@nestjs/common';
import { MessagesCreate } from './MessagesCreate';
import { TextMessagesCreate } from '../../TextMessages/application/TextMessagesCreate';
import { MediaMessagesCreate } from '../../MediaMessages/application/MediaMessagesCreate';
import { ReactionMessagesCreate } from '../../ReactionMessages/application/ReactionMessagesCreate';
import {
  MessageSender,
  TextPayload,
  MediaPayload,
  ReactPayload,
} from '../domain/ports/MessageSender';
import * as path from 'path';
import { lookup } from 'mime-types';
import * as crypto from 'crypto';

@Injectable()
export class MessagesOrchestrator {
  constructor(
    @Inject('MessagesCreate')
    private readonly messagesCreate: MessagesCreate,
    @Inject('TextMessagesCreate')
    private readonly textMessagesCreate: TextMessagesCreate,
    @Inject('MediaMessagesCreate')
    private readonly mediaMessagesCreate: MediaMessagesCreate,
    @Inject('ReactionMessagesCreate')
    private readonly reactionMessagesCreate: ReactionMessagesCreate,
    @Inject('MessageSender')
    private readonly messageSender: MessageSender,
  ) {}
  async sendTextMessage(
    sessionId: string,
    to: string,
    text: string,
    quotedMessageId?: Record<string, any>,
  ): Promise<any> {
    try {
      const payload: TextPayload = {
        text,
      };
      const sentMessage = await this.messageSender.sendTextMessage(
        sessionId,
        `${to}@s.whatsapp.net`,
        payload,
        quotedMessageId ? quotedMessageId : undefined,
      );

      if (!sentMessage || !sentMessage.key || !sentMessage.key.id) {
        throw new Error(
          'Failed to send text message through WhatsApp or invalid message key',
        );
      }
      const uuid = crypto.randomUUID();

      await this.messagesCreate.run(
        uuid, // UUID como ID principal
        sentMessage, // Complete Baileys message object as JSON
        'txt',
        quotedMessageId ? JSON.stringify(quotedMessageId) : null,
        sessionId,
        to,
        new Date(),
      );

      await this.textMessagesCreate.run(
        crypto.randomUUID(),
        uuid, // Usamos el UUID como message_id para la relación
        text,
      );

      return sentMessage;
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
    quotedMessageId?: Record<string, any>,
  ): Promise<any> {
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
        quotedMessageId ? quotedMessageId : undefined,
      );
      if (!sentMessage || !sentMessage.key || !sentMessage.key.id) {
        throw new Error(
          'Failed to send media message through WhatsApp or invalid message key',
        );
      }

      const uuid = crypto.randomUUID(); // 2. Create base message record first (parent record)

      await this.messagesCreate.run(
        uuid, // UUID como ID principal
        sentMessage, // Complete Baileys message object as JSON
        'media',
        quotedMessageId ? JSON.stringify(quotedMessageId) : null,
        sessionId,
        to,
        new Date(),
      ); // 3. Create media message record (child record)
      // Use the file information extracted earlier
      await this.mediaMessagesCreate.run(
        crypto.randomUUID(),
        uuid, // Usamos el UUID como message_id para la relación
        caption || null,
        mediaType,
        mimeType,
        fileName,
        mediaUrl,
      );

      return sentMessage;
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
  ): Promise<any> {
    try {
      // 1. Send reaction through Baileys first to get WhatsApp message ID
      const payload: ReactPayload = { key: messageKey, emoji };
      const sentMessage = await this.messageSender.sendReactMessage(
        sessionId,
        `${to}@s.whatsapp.net`,
        payload,
      );
      if (!sentMessage || !sentMessage.key || !sentMessage.key.id) {
        throw new Error(
          'Failed to send reaction through WhatsApp or invalid message key',
        );
      }

      const uuid = crypto.randomUUID(); // 2. Create base message record first (parent record)

      await this.messagesCreate.run(
        uuid, // UUID como ID principal
        sentMessage, // Complete Baileys message object as JSON
        'react',
        targetMessageId,
        sessionId,
        to,
        new Date(),
      ); // 3. Create reaction message record (child record)
      await this.reactionMessagesCreate.run(
        crypto.randomUUID(),
        uuid, // Usamos el UUID como message_id para la relación
        emoji,
        targetMessageId,
      );

      return sentMessage;
    } catch (error) {
      console.error('Error in sendReaction orchestration:', error);
      throw error;
    }
  }
}
