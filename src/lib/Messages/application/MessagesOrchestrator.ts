import { Injectable, Inject } from '@nestjs/common';
import { MessagesCreate } from './MessagesCreate';
import { MessagesGetOneById } from './MessagesGetOneById';
import { TextMessagesCreate } from '../../TextMessages/application/TextMessagesCreate';
import { MediaMessagesCreate } from '../../MediaMessages/application/MediaMessagesCreate';
import { ReactionMessagesCreate } from '../../ReactionMessages/application/ReactionMessagesCreate';
import { MessageStatusTrackSentMessage } from '../../MessageStatus/application/MessageStatusTrackSentMessage';
import { MessageStatusCreateMessageReceipt } from '../../MessageStatus/application/MessageStatusCreateMessageReceipt';
import { MessageStatusCreateValidated } from '../../MessageStatus/application/MessageStatusCreateValidated';
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
    private readonly messageStatusTracker?: MessageStatusTrackSentMessage,
    private readonly messageStatusCreateReceipt?: MessageStatusCreateMessageReceipt,
    private readonly messageStatusCreateValidated?: MessageStatusCreateValidated,
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
    predefinedUuid?: string,
  ): Promise<any> {
    try {
      // Use predefined UUID or generate new one
      const uuid = predefinedUuid || this.cryptoService.generateUUID();

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

      // Create message records first (message table is the parent)
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
        uuid, // Use the UUID as message_id directly
        text,
      );

      // Now create status records (message_status table references messages table)
      // 1. Create initial message_receipt status when request is detected
      if (this.messageStatusCreateReceipt) {
        await this.messageStatusCreateReceipt.run(uuid);
      }

      // 2. Create validated status after DTO/VO validations pass
      if (this.messageStatusCreateValidated) {
        await this.messageStatusCreateValidated.run(uuid);
      }

      // Create sent message status (transition from validated to sent)
      if (this.messageStatusTracker) {
        await this.messageStatusTracker.run(uuid);
      }

      return {
        baileysMessage: sentMessage,
        uuid: uuid,
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
    predefinedUuid?: string,
  ): Promise<any> {
    try {
      // Use predefined UUID or generate new one
      const uuid = predefinedUuid || this.cryptoService.generateUUID();

      const quotedMessageData =
        await this.getQuotedMessageData(quotedMessageId);

      // Extract file information first
      const fileName = this.fileService.getFileName(mediaUrl);
      const mimeType = this.fileService.getMimeType(mediaUrl);

      // Send message through Baileys to get WhatsApp message ID
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

      // Create message records first (message table is the parent)
      await this.messagesCreate.run(
        uuid, // UUID como ID principal
        sentMessage, // Complete Baileys message object as JSON
        'media',
        quotedMessageId || null,
        sessionId,
        to,
        new Date(),
      );
      // Create media message record (child record)
      // Use the file information extracted earlier
      await this.mediaMessagesCreate.run(
        uuid, // Use the UUID as message_id directly
        caption || null,
        mediaType,
        mimeType,
        fileName,
        mediaUrl,
      );

      // Now create status records (message_status table references messages table)
      // 1. Create initial message_receipt status when request is detected
      if (this.messageStatusCreateReceipt) {
        await this.messageStatusCreateReceipt.run(uuid);
      }

      // 2. Create validated status after DTO/VO validations pass
      if (this.messageStatusCreateValidated) {
        await this.messageStatusCreateValidated.run(uuid);
      }

      // Create sent message status (transition from validated to sent)
      if (this.messageStatusTracker) {
        await this.messageStatusTracker.run(uuid);
      }

      return {
        baileysMessage: sentMessage,
        uuid: uuid,
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
    predefinedUuid?: string,
  ): Promise<any> {
    try {
      // Use predefined UUID or generate new one
      const uuid = predefinedUuid || this.cryptoService.generateUUID();

      // Send reaction through Baileys to get WhatsApp message ID
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

      // Create message records first (message table is the parent)
      await this.messagesCreate.run(
        uuid, // UUID como ID principal
        sentMessage, // Complete Baileys message object as JSON
        'react',
        targetMessageId, // Use the actual target message ID (UUID)
        sessionId,
        to,
        new Date(),
      );
      // Create reaction message record (child record)
      await this.reactionMessagesCreate.run(
        uuid, // Use the UUID as message_id directly
        emoji,
        targetMessageId, // Use the target message ID (should be UUID)
      );

      // Now create status records (message_status table references messages table)
      // 1. Create initial message_receipt status when request is detected
      if (this.messageStatusCreateReceipt) {
        await this.messageStatusCreateReceipt.run(uuid);
      }

      // 2. Create validated status after DTO/VO validations pass
      if (this.messageStatusCreateValidated) {
        await this.messageStatusCreateValidated.run(uuid);
      }

      // Create sent message status (transition from validated to sent)
      if (this.messageStatusTracker) {
        await this.messageStatusTracker.run(uuid);
      }

      return {
        baileysMessage: sentMessage,
        uuid: uuid,
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
