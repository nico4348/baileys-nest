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

  async handleIncomingMessages(sessionId: string, messages: any[], socket?: any): Promise<void> {
    console.log(`📩 [${sessionId}] Processing ${messages.length} messages`);
    
    for (const message of messages) {
      try {
        await this.processIncomingMessage(sessionId, message, socket);
      } catch (error) {
        console.error(`❌ [${sessionId}] Error processing message ${message.key?.id}: ${error.message}`);
      }
    }
  }

  private async processIncomingMessage(sessionId: string, baileysMessage: any, socket?: any): Promise<void> {
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
    await this.createSpecificMessageType(uuid, messageType, baileysMessage, sessionId, socket);
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
    sessionId: string,
    socket?: any,
  ): Promise<void> {
    console.log(`🏗️ [MessagesHandleIncoming] Creating specific message type: ${messageType} for messageId: ${messageId}`);
    
    switch (messageType) {
      case 'txt':
        await this.createTextMessage(messageId, baileysMessage);
        break;
      case 'media':
        await this.createMediaMessage(messageId, baileysMessage, sessionId, socket);
        break;
      case 'react':
        await this.createReactionMessage(messageId, baileysMessage);
        break;
    }
    
    console.log(`✅ [MessagesHandleIncoming] Successfully created ${messageType} message record for messageId: ${messageId}`);
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

  private async createMediaMessage(messageId: string, baileysMessage: any, sessionId: string, socket?: any): Promise<void> {
    console.log(`📷 [MessagesHandleIncoming] Creating media message for messageId: ${messageId}`);
    
    const message = baileysMessage.message;
    let mediaType = '';
    let caption = null;
    let mimeType = '';
    let fileName = '';

    console.log(`📷 [MessagesHandleIncoming] Analyzing media message structure:`, {
      hasImageMessage: !!message.imageMessage,
      hasVideoMessage: !!message.videoMessage,
      hasAudioMessage: !!message.audioMessage,
      hasDocumentMessage: !!message.documentMessage,
      hasStickerMessage: !!message.stickerMessage
    });

    if (message.imageMessage) {
      mediaType = 'image';
      caption = message.imageMessage.caption || null;
      mimeType = message.imageMessage.mimetype || 'image/jpeg';
      fileName = 'image.' + (mimeType.split('/')[1] || 'jpg');
      console.log(`🖼️ [MessagesHandleIncoming] Detected IMAGE - mimetype: ${mimeType}, caption: ${caption}`);
    } else if (message.videoMessage) {
      mediaType = 'video';
      caption = message.videoMessage.caption || null;
      mimeType = message.videoMessage.mimetype || 'video/mp4';
      fileName = 'video.' + (mimeType.split('/')[1] || 'mp4');
      console.log(`🎥 [MessagesHandleIncoming] Detected VIDEO - mimetype: ${mimeType}, caption: ${caption}`);
    } else if (message.audioMessage) {
      mediaType = 'audio';
      mimeType = message.audioMessage.mimetype || 'audio/ogg';
      fileName = 'audio.' + (mimeType.split('/')[1] || 'ogg');
      console.log(`🎵 [MessagesHandleIncoming] Detected AUDIO - mimetype: ${mimeType}`);
    } else if (message.documentMessage) {
      mediaType = 'document';
      caption = message.documentMessage.caption || null;
      mimeType = message.documentMessage.mimetype || 'application/octet-stream';
      fileName = message.documentMessage.fileName || 'document';
      console.log(`📄 [MessagesHandleIncoming] Detected DOCUMENT - mimetype: ${mimeType}, fileName: ${fileName}, caption: ${caption}`);
    } else if (message.stickerMessage) {
      mediaType = 'sticker';
      mimeType = message.stickerMessage.mimetype || 'image/webp';
      fileName = 'sticker.webp';
      console.log(`🌟 [MessagesHandleIncoming] Detected STICKER - mimetype: ${mimeType}`);
    }

    if (mediaType) {
      console.log(`💾 [MessagesHandleIncoming] Saving media message to database:`, {
        messageId,
        mediaType,
        mimeType,
        fileName,
        caption
      });
      
      await this.mediaMessagesCreate.run(
        messageId,
        caption,
        mediaType,
        mimeType,
        fileName,
        '', // file_path - empty for incoming messages as they're not downloaded yet
      );
      
      console.log(`✅ [MessagesHandleIncoming] Media message saved successfully to database`);
      
      // Automatically download media
      console.log(`📥 [MessagesHandleIncoming] Starting automatic media download...`);
      try {
        const downloadedFilePath = await this.downloadMediaFromBaileys(sessionId, baileysMessage, messageId, mediaType, socket);
        if (downloadedFilePath) {
          console.log(`✅ [MessagesHandleIncoming] Media downloaded and saved to: ${downloadedFilePath}`);
          
          // Automatically upload to S3
          console.log(`☁️ [MessagesHandleIncoming] Starting automatic S3 upload...`);
          try {
            const s3UploadResult = await this.s3MediaUploader.uploadFileToS3(
              downloadedFilePath,
              sessionId,
              messageId,
              mimeType
            );

            if (s3UploadResult.success && s3UploadResult.s3Url) {
              console.log(`✅ [MessagesHandleIncoming] S3 upload successful: ${s3UploadResult.s3Url}`);
              
              // Update database with S3 URL instead of local path
              console.log(`📝 [MessagesHandleIncoming] Updating database with S3 URL...`);
              await this.mediaMessagesUpdate.run(
                messageId,
                caption,
                mediaType,
                mimeType,
                fileName,
                s3UploadResult.s3Url
              );
              console.log(`✅ [MessagesHandleIncoming] Database updated with S3 URL: ${s3UploadResult.s3Url}`);

              // Delete temporary local file
              console.log(`🗑️ [MessagesHandleIncoming] Deleting temporary local file...`);
              await this.s3MediaUploader.deleteTemporaryFile(downloadedFilePath);
              console.log(`✅ [MessagesHandleIncoming] Temporary file deleted successfully`);
            } else {
              console.error(`❌ [MessagesHandleIncoming] S3 upload failed: ${s3UploadResult.error}`);
              
              // Update database with local path as fallback
              console.log(`📝 [MessagesHandleIncoming] Updating database with local file path as fallback...`);
              await this.mediaMessagesUpdate.run(
                messageId,
                caption,
                mediaType,
                mimeType,
                fileName,
                downloadedFilePath
              );
              console.log(`✅ [MessagesHandleIncoming] Database updated with local file path: ${downloadedFilePath}`);
            }
          } catch (s3Error) {
            console.error(`❌ [MessagesHandleIncoming] Error during S3 upload:`, s3Error);
            
            // Update database with local path as fallback
            console.log(`📝 [MessagesHandleIncoming] Updating database with local file path as fallback...`);
            await this.mediaMessagesUpdate.run(
              messageId,
              caption,
              mediaType,
              mimeType,
              fileName,
              downloadedFilePath
            );
            console.log(`✅ [MessagesHandleIncoming] Database updated with local file path: ${downloadedFilePath}`);
          }
        } else {
          console.log(`❌ [MessagesHandleIncoming] Failed to download media`);
        }
      } catch (error) {
        console.error(`❌ [MessagesHandleIncoming] Error downloading media:`, error);
      }
    } else {
      console.log(`❌ [MessagesHandleIncoming] No media type detected in message`);
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

  private async downloadMediaFromBaileys(
    sessionId: string,
    baileysMessage: any,
    messageId: string,
    mediaType: string,
    socket?: any
  ): Promise<string | null> {
    console.log(`📥 [MessagesHandleIncoming] downloadMediaFromBaileys - sessionId: ${sessionId}, messageId: ${messageId}, mediaType: ${mediaType}`);
    
    try {
      if (!socket) {
        console.error(`❌ [MessagesHandleIncoming] Socket not provided for session: ${sessionId}`);
        return null;
      }

      console.log(`📥 [MessagesHandleIncoming] Socket found, starting download...`);

      const message = baileysMessage.message;
      let baileyMediaType: 'image' | 'video' | 'audio' | 'document' | 'sticker' | null = null;
      let mediaContent: any = null;
      let fileExtension = '';

      // Determine Baileys media type and get media content
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
        console.error(`❌ [MessagesHandleIncoming] Could not determine media type or content`);
        return null;
      }

      console.log(`📥 [MessagesHandleIncoming] Downloading ${baileyMediaType} content...`);

      // Download the media content using Baileys
      const stream = await downloadContentFromMessage(mediaContent, baileyMediaType);
      const chunks: Buffer[] = [];
      
      for await (const chunk of stream) {
        chunks.push(chunk);
      }

      const buffer = Buffer.concat(chunks);
      console.log(`📥 [MessagesHandleIncoming] Downloaded ${buffer.length} bytes`);

      // Save to local file
      const fileName = `${messageId}${fileExtension}`;
      const filePath = path.join(MEDIA_DIR, fileName);
      
      await fs.writeFile(filePath, buffer);
      console.log(`📥 [MessagesHandleIncoming] File saved to: ${filePath}`);

      // Update the database with the file path
      const updatedMediaMessage = {
        messageId,
        caption: mediaContent.caption || null,
        mediaType,
        mimeType: mediaContent.mimetype || 'application/octet-stream',
        fileName,
        filePath,
      };

      console.log(`📥 [MessagesHandleIncoming] Updating database with file path...`);
      // We need to call MediaMessagesUpdate here, but we don't have it injected
      // For now, we'll return the file path and handle the update elsewhere
      
      return filePath;
    } catch (error) {
      console.error(`❌ [MessagesHandleIncoming] Error downloading media:`, error);
      return null;
    }
  }
}