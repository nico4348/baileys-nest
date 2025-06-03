import { Injectable, Inject } from '@nestjs/common';
import { MessagesCreate } from './MessagesCreate';
import { TextMessagesCreate } from '../../TextMessages/application/TextMessagesCreate';
import { MediaMessagesCreate } from '../../MediaMessages/application/MediaMessagesCreate';
import { ReactionMessagesCreate } from '../../ReactionMessages/application/ReactionMessagesCreate';
import { CryptoService } from '../domain/ports/CryptoService';

@Injectable()
export class MessagesHandleIncoming {
  constructor(
    @Inject('MessagesCreate')
    private readonly messagesCreate: MessagesCreate,
    @Inject('TextMessagesCreate')
    private readonly textMessagesCreate: TextMessagesCreate,
    @Inject('MediaMessagesCreate')
    private readonly mediaMessagesCreate: MediaMessagesCreate,
    @Inject('ReactionMessagesCreate')
    private readonly reactionMessagesCreate: ReactionMessagesCreate,
    @Inject('CryptoService')
    private readonly cryptoService: CryptoService,
  ) {}

  async handleIncomingMessages(sessionId: string, messages: any[]): Promise<void> {
    for (const message of messages) {
      try {
        await this.processIncomingMessage(sessionId, message);
      } catch (error) {
        console.error(`Error processing incoming message: ${error.message}`, error);
      }
    }
  }

  private async processIncomingMessage(sessionId: string, baileysMessage: any): Promise<void> {
    // Skip if message is from me (outgoing messages are handled elsewhere)
    if (baileysMessage.key?.fromMe) {
      return;
    }

    const uuid = this.cryptoService.generateUUID();
    const messageType = this.determineMessageType(baileysMessage);
    const to = this.extractTo(baileysMessage);
    const quotedMessageId = await this.extractQuotedMessageId(baileysMessage);

    // Create main message record with fromMe = false
    await this.messagesCreate.run(
      uuid,
      baileysMessage,
      messageType,
      quotedMessageId,
      sessionId,
      to,
      false, // fromMe: false for incoming messages
      new Date(),
    );

    // Create specific message type record
    await this.createSpecificMessageType(uuid, messageType, baileysMessage);
  }

  private determineMessageType(message: any): 'txt' | 'media' | 'react' {
    if (message.message?.reactionMessage) {
      return 'react';
    }
    
    if (message.message?.conversation || message.message?.extendedTextMessage) {
      return 'txt';
    }
    
    // Check for various media types
    if (
      message.message?.imageMessage ||
      message.message?.videoMessage ||
      message.message?.audioMessage ||
      message.message?.documentMessage ||
      message.message?.stickerMessage
    ) {
      return 'media';
    }

    // Default to text if unable to determine
    return 'txt';
  }

  private extractTo(message: any): string {
    // Extract the phone number without @s.whatsapp.net
    const remoteJid = message.key?.remoteJid || '';
    return remoteJid.replace('@s.whatsapp.net', '');
  }

  private async extractQuotedMessageId(message: any): Promise<string | null> {
    // For text messages with quotes
    if (message.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
      return message.message.extendedTextMessage.contextInfo.stanzaId || null;
    }

    // For other message types with quotes
    if (message.message?.contextInfo?.quotedMessage) {
      return message.message.contextInfo.stanzaId || null;
    }

    return null;
  }

  private async createSpecificMessageType(
    messageId: string,
    messageType: 'txt' | 'media' | 'react',
    baileysMessage: any,
  ): Promise<void> {
    switch (messageType) {
      case 'txt':
        await this.createTextMessage(messageId, baileysMessage);
        break;
      case 'media':
        await this.createMediaMessage(messageId, baileysMessage);
        break;
      case 'react':
        await this.createReactionMessage(messageId, baileysMessage);
        break;
    }
  }

  private async createTextMessage(messageId: string, baileysMessage: any): Promise<void> {
    let textContent = '';

    if (baileysMessage.message?.conversation) {
      textContent = baileysMessage.message.conversation;
    } else if (baileysMessage.message?.extendedTextMessage?.text) {
      textContent = baileysMessage.message.extendedTextMessage.text;
    }

    if (textContent) {
      await this.textMessagesCreate.run(messageId, textContent);
    }
  }

  private async createMediaMessage(messageId: string, baileysMessage: any): Promise<void> {
    const message = baileysMessage.message;
    let mediaType = '';
    let caption = null;
    let mimeType = '';
    let fileName = '';

    if (message.imageMessage) {
      mediaType = 'image';
      caption = message.imageMessage.caption || null;
      mimeType = message.imageMessage.mimetype || 'image/jpeg';
      fileName = 'image.' + (mimeType.split('/')[1] || 'jpg');
    } else if (message.videoMessage) {
      mediaType = 'video';
      caption = message.videoMessage.caption || null;
      mimeType = message.videoMessage.mimetype || 'video/mp4';
      fileName = 'video.' + (mimeType.split('/')[1] || 'mp4');
    } else if (message.audioMessage) {
      mediaType = 'audio';
      mimeType = message.audioMessage.mimetype || 'audio/ogg';
      fileName = 'audio.' + (mimeType.split('/')[1] || 'ogg');
    } else if (message.documentMessage) {
      mediaType = 'document';
      caption = message.documentMessage.caption || null;
      mimeType = message.documentMessage.mimetype || 'application/octet-stream';
      fileName = message.documentMessage.fileName || 'document';
    } else if (message.stickerMessage) {
      mediaType = 'sticker';
      mimeType = message.stickerMessage.mimetype || 'image/webp';
      fileName = 'sticker.webp';
    }

    if (mediaType) {
      await this.mediaMessagesCreate.run(
        messageId,
        caption,
        mediaType,
        mimeType,
        fileName,
        '', // file_path - empty for incoming messages as they're not downloaded yet
      );
    }
  }

  private async createReactionMessage(messageId: string, baileysMessage: any): Promise<void> {
    const reactionMessage = baileysMessage.message?.reactionMessage;
    
    if (reactionMessage) {
      const emoji = reactionMessage.text || '';
      const targetMessageKey = reactionMessage.key;
      
      // For reactions, we need to find the target message ID in our system
      // This is a simplified approach - in practice, you might want to look up
      // the target message by its Baileys key to get the UUID
      const targetMessageId = targetMessageKey?.id || null;

      if (emoji && targetMessageId) {
        await this.reactionMessagesCreate.run(
          messageId,
          emoji,
          targetMessageId,
        );
      }
    }
  }
}