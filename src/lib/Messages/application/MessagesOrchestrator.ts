import { Injectable, Inject } from '@nestjs/common';
import { MessagesCreate } from './MessagesCreate';
import { MessagesGetOneById } from './MessagesGetOneById';
import { TextMessagesCreate } from '../../TextMessages/application/TextMessagesCreate';
import { MediaMessagesCreate } from '../../MediaMessages/application/MediaMessagesCreate';
import { ReactionMessagesCreate } from '../../ReactionMessages/application/ReactionMessagesCreate';
import {
  MessageSender,
  TextPayload,
  MediaPayload,
  ReactPayload,
} from '../domain/ports/MessageSender';
import { FileService } from '../domain/ports/FileService';
import { CryptoService } from '../domain/ports/CryptoService';

@Injectable()
export class MessagesOrchestrator {
  constructor(
    @Inject('MessagesCreate')
    private readonly messagesCreate: MessagesCreate,
    @Inject('MessagesGetOneById')
    private readonly messagesGetOneById: MessagesGetOneById,
    @Inject('TextMessagesCreate')
    private readonly textMessagesCreate: TextMessagesCreate,
    @Inject('MediaMessagesCreate')
    private readonly mediaMessagesCreate: MediaMessagesCreate,
    @Inject('ReactionMessagesCreate')
    private readonly reactionMessagesCreate: ReactionMessagesCreate,
    @Inject('MessageSender')
    private readonly messageSender: MessageSender,
    @Inject('FileService')
    private readonly fileService: FileService,
    @Inject('CryptoService')
    private readonly cryptoService: CryptoService,
  ) {}

  private async getQuotedMessageData(
    quotedMessageId?: string,
  ): Promise<Record<string, any> | undefined> {
    if (!quotedMessageId) {
      return undefined;
    }

    try {
      const message = await this.messagesGetOneById.run(quotedMessageId);
      if (!message || !message.baileys_json) {
        return undefined;
      }

      return message.baileys_json.value;
    } catch (error) {
      console.error('Error fetching quoted message:', error);
      return undefined;
    }
  }

  async sendTextMessage(
    sessionId: string,
    to: string,
    text: string,
    quotedMessageId?: string,
  ): Promise<any> {
    try {
      const quotedMessageData =
        await this.getQuotedMessageData(quotedMessageId);

      const payload: TextPayload = {
        text,
      };
      const sentMessage = await this.messageSender.sendTextMessage(
        sessionId,
        `${to}@s.whatsapp.net`,
        payload,
        quotedMessageData,
      );

      if (!sentMessage || !sentMessage.key || !sentMessage.key.id) {
        throw new Error(
          'Failed to send text message through WhatsApp or invalid message key',
        );
      }
      const uuid = this.cryptoService.generateUUID();

      await this.messagesCreate.run(
        uuid, // UUID como ID principal
        sentMessage, // Complete Baileys message object as JSON
        'txt',
        quotedMessageId || null,
        sessionId,
        to,
        new Date(),
      );

      await this.textMessagesCreate.run(
        this.cryptoService.generateUUID(),
        uuid, // Usamos el UUID como message_id para la relación
        text,
      );

      return { 
        baileysMessage: sentMessage, 
        uuid: uuid 
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
  ): Promise<any> {
    try {
      const quotedMessageData =
        await this.getQuotedMessageData(quotedMessageId);

      // Extract file information first
      const fileName = this.fileService.getFileName(mediaUrl);
      const mimeType = this.fileService.getMimeType(mediaUrl);

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
        quotedMessageData,
      );
      if (!sentMessage || !sentMessage.key || !sentMessage.key.id) {
        throw new Error(
          'Failed to send media message through WhatsApp or invalid message key',
        );
      }

      const uuid = this.cryptoService.generateUUID(); // 2. Create base message record first (parent record)

      await this.messagesCreate.run(
        uuid, // UUID como ID principal
        sentMessage, // Complete Baileys message object as JSON
        'media',
        quotedMessageId || null,
        sessionId,
        to,
        new Date(),
      ); // 3. Create media message record (child record)
      // Use the file information extracted earlier
      await this.mediaMessagesCreate.run(
        this.cryptoService.generateUUID(),
        uuid, // Usamos el UUID como message_id para la relación
        caption || null,
        mediaType,
        mimeType,
        fileName,
        mediaUrl,
      );

      return { 
        baileysMessage: sentMessage, 
        uuid: uuid 
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

      const uuid = this.cryptoService.generateUUID(); // 2. Create base message record first (parent record)

      await this.messagesCreate.run(
        uuid, // UUID como ID principal
        sentMessage, // Complete Baileys message object as JSON
        'react',
        targetMessageId, // Use the actual target message ID (UUID)
        sessionId,
        to,
        new Date(),
      ); // 3. Create reaction message record (child record)
      await this.reactionMessagesCreate.run(
        this.cryptoService.generateUUID(),
        uuid, // Usamos el UUID como message_id para la relación
        emoji,
        targetMessageId, // Use the target message ID (should be UUID)
      );

      return { 
        baileysMessage: sentMessage, 
        uuid: uuid 
      };
    } catch (error) {
      console.error('Error in sendReaction orchestration:', error);
      throw error;
    }
  }

  // Nuevo método: obtener messageKey de Baileys usando UUID de mensaje
  async getMessageBaileysKey(messageUuid: string): Promise<any> {
    const message = await this.messagesGetOneById.run(messageUuid);
    if (!message || !message.baileys_json) {
      throw new Error(
        `Original message with id ${messageUuid} not found or missing baileys_json`,
      );
    }
    return message.baileys_json.value.key;
  }
}
