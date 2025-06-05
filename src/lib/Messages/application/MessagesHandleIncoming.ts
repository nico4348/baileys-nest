import { Injectable, Inject } from '@nestjs/common';
import { MessagesCreate } from './MessagesCreate';
import { TextMessagesCreate } from '../../TextMessages/application/TextMessagesCreate';
import { MediaMessagesCreate } from '../../MediaMessages/application/MediaMessagesCreate';
import { MediaMessagesUpdate } from '../../MediaMessages/application/MediaMessagesUpdate';
import { ReactionMessagesCreate } from '../../ReactionMessages/application/ReactionMessagesCreate';
import { CryptoService } from '../domain/ports/CryptoService';
import { S3MediaUploader } from '../../MediaMessages/infrastructure/S3MediaUploader';
import { downloadContentFromMessage } from 'baileys';
import * as fs from 'fs/promises';
import * as path from 'path';

const MEDIA_DIR = path.join(process.cwd(), 'media');

// Ensure media directory exists
(async () => {
  try {
    await fs.mkdir(MEDIA_DIR, { recursive: true });
  } catch (error) {
    console.error('Error creating media directory:', error);
  }
})();

@Injectable()
export class MessagesHandleIncoming {
  constructor(
    @Inject('MessagesCreate')
    private readonly messagesCreate: MessagesCreate,
    @Inject('TextMessagesCreate')
    private readonly textMessagesCreate: TextMessagesCreate,
    @Inject('MediaMessagesCreate')
    private readonly mediaMessagesCreate: MediaMessagesCreate,
    @Inject('MediaMessagesUpdate')
    private readonly mediaMessagesUpdate: MediaMessagesUpdate,
    @Inject('ReactionMessagesCreate')
    private readonly reactionMessagesCreate: ReactionMessagesCreate,
    @Inject('CryptoService')
    private readonly cryptoService: CryptoService,
    @Inject('S3MediaUploader')
    private readonly s3MediaUploader: S3MediaUploader,
  ) {}

  async handleIncomingMessages(
    sessionId: string,
    messages: any[],
    socket?: any,
  ): Promise<void> {
    for (const message of messages) {
      try {
        await this.processIncomingMessage(sessionId, message, socket);
      } catch (error) {
        console.error(
          `❌ [${sessionId}] Error processing message ${message.key?.id}: ${error.message}`,
        );
      }
    }
  }

  private async processIncomingMessage(
    sessionId: string,
    baileysMessage: any,
    socket?: any,
  ): Promise<void> {
    if (baileysMessage.key?.fromMe) {
      return;
    }

    const uuid = this.cryptoService.generateUUID();
    const messageType = this.determineMessageType(baileysMessage);
    const to = this.extractTo(baileysMessage);
    const quotedMessageId = await this.extractQuotedMessageId(baileysMessage);

    await this.messagesCreate.run(
      uuid,
      baileysMessage,
      messageType,
      quotedMessageId,
      sessionId,
      to,
      false,
      new Date(),
    );

    await this.createSpecificMessageType(
      uuid,
      messageType,
      baileysMessage,
      sessionId,
      socket,
    );
  }

  private determineMessageType(message: any): 'txt' | 'media' | 'react' {
    if (message.message?.reactionMessage) {
      return 'react';
    }
    if (message.message?.conversation || message.message?.extendedTextMessage) {
      return 'txt';
    }
    if (
      message.message?.imageMessage ||
      message.message?.videoMessage ||
      message.message?.audioMessage ||
      message.message?.documentMessage ||
      message.message?.stickerMessage
    ) {
      return 'media';
    }
    return 'txt';
  }

  private extractTo(message: any): string {
    const remoteJid = message.key?.remoteJid || '';
    return remoteJid.replace('@s.whatsapp.net', '');
  }

  private async extractQuotedMessageId(message: any): Promise<string | null> {
    if (message.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
      return message.message.extendedTextMessage.contextInfo.stanzaId || null;
    }
    if (message.message?.contextInfo?.quotedMessage) {
      return message.message.contextInfo.stanzaId || null;
    }
    return null;
  }

  private async createSpecificMessageType(
    messageId: string,
    messageType: 'txt' | 'media' | 'react',
    baileysMessage: any,
    sessionId: string,
    socket?: any,
  ): Promise<void> {
    switch (messageType) {
      case 'txt':
        await this.createTextMessage(messageId, baileysMessage);
        break;
      case 'media':
        await this.createMediaMessage(
          messageId,
          baileysMessage,
          sessionId,
          socket,
        );
        break;
      case 'react':
        await this.createReactionMessage(messageId, baileysMessage);
        break;
    }
  }

  private async createTextMessage(
    messageId: string,
    baileysMessage: any,
  ): Promise<void> {
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

  private async createMediaMessage(
    messageId: string,
    baileysMessage: any,
    sessionId: string,
    socket?: any,
  ): Promise<void> {
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
        '',
      );

      try {
        const downloadedFilePath = await this.downloadMediaFromBaileys(
          sessionId,
          baileysMessage,
          messageId,
          mediaType,
          socket,
        );
        if (downloadedFilePath) {
          try {
            const s3UploadResult = await this.s3MediaUploader.uploadFileToS3(
              downloadedFilePath,
              sessionId,
              messageId,
              mimeType,
            );

            if (s3UploadResult.success && s3UploadResult.s3Url) {
              await this.mediaMessagesUpdate.run(
                messageId,
                caption,
                mediaType,
                mimeType,
                fileName,
                s3UploadResult.s3Url,
              );
              await this.s3MediaUploader.deleteTemporaryFile(
                downloadedFilePath,
              );
            } else {
              await this.mediaMessagesUpdate.run(
                messageId,
                caption,
                mediaType,
                mimeType,
                fileName,
                downloadedFilePath,
              );
            }
          } catch (s3Error) {
            console.error(
              `❌ [MessagesHandleIncoming] Error during S3 upload:`,
              s3Error,
            );
            await this.mediaMessagesUpdate.run(
              messageId,
              caption,
              mediaType,
              mimeType,
              fileName,
              downloadedFilePath,
            );
          }
        }
      } catch (error) {
        console.error(
          `❌ [MessagesHandleIncoming] Error downloading media:`,
          error,
        );
      }
    }
  }

  private async createReactionMessage(
    messageId: string,
    baileysMessage: any,
  ): Promise<void> {
    const reactionMessage = baileysMessage.message?.reactionMessage;

    if (reactionMessage) {
      const emoji = reactionMessage.text || '';
      const targetMessageKey = reactionMessage.key;
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

  private async downloadMediaFromBaileys(
    sessionId: string,
    baileysMessage: any,
    messageId: string,
    mediaType: string,
    socket?: any,
  ): Promise<string | null> {
    try {
      if (!socket) {
        console.error(
          `❌ [MessagesHandleIncoming] Socket not provided for session: ${sessionId}`,
        );
        return null;
      }

      const message = baileysMessage.message;
      let baileyMediaType:
        | 'image'
        | 'video'
        | 'audio'
        | 'document'
        | 'sticker'
        | null = null;
      let mediaContent: any = null;
      let fileExtension = '';

      if (message.imageMessage) {
        baileyMediaType = 'image';
        mediaContent = message.imageMessage;
        fileExtension = '.jpg';
      } else if (message.videoMessage) {
        baileyMediaType = 'video';
        mediaContent = message.videoMessage;
        fileExtension = '.mp4';
      } else if (message.audioMessage) {
        baileyMediaType = 'audio';
        mediaContent = message.audioMessage;
        fileExtension = '.ogg';
      } else if (message.documentMessage) {
        baileyMediaType = 'document';
        mediaContent = message.documentMessage;
        const mimeType = mediaContent.mimetype || '';
        fileExtension = '.' + (mimeType.split('/')[1] || 'bin');
      } else if (message.stickerMessage) {
        baileyMediaType = 'sticker';
        mediaContent = message.stickerMessage;
        fileExtension = '.webp';
      }

      if (!baileyMediaType || !mediaContent) {
        console.error(
          `❌ [MessagesHandleIncoming] Could not determine media type or content`,
        );
        return null;
      }

      const stream = await downloadContentFromMessage(
        mediaContent,
        baileyMediaType,
      );
      const chunks: Buffer[] = [];

      for await (const chunk of stream) {
        chunks.push(chunk);
      }

      const buffer = Buffer.concat(chunks);
      const fileName = `${messageId}${fileExtension}`;
      const filePath = path.join(MEDIA_DIR, fileName);

      await fs.writeFile(filePath, buffer);

      return filePath;
    } catch (error) {
      console.error(
        `❌ [MessagesHandleIncoming] Error downloading media:`,
        error,
      );
      return null;
    }
  }
}
