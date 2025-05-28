import { MessagesCreate } from './MessagesCreate';
import { TextMessagesCreate } from '../../TextMessages/application/TextMessagesCreate';
import { MediaMessagesCreate } from '../../MediaMessages/application/MediaMessagesCreate';
import { ReactionMessagesCreate } from '../../ReactionMessages/application/ReactionMessagesCreate';
import { TextMessagesSendText } from '../../TextMessages/application/TextMessagesSendText';
import { MediaMessagesSendMedia } from '../../MediaMessages/application/MediaMessagesSendMedia';
import { ReactionMessagesSendReaction } from '../../ReactionMessages/application/ReactionMessagesSendReaction';
import { v4 as uuidv4 } from 'uuid';

export class MessagesOrchestrator {
  constructor(
    private readonly messagesCreate: MessagesCreate,
    private readonly textMessagesCreate: TextMessagesCreate,
    private readonly mediaMessagesCreate: MediaMessagesCreate,
    private readonly reactionMessagesCreate: ReactionMessagesCreate,
    private readonly textMessagesSendText: TextMessagesSendText,
    private readonly mediaMessagesSendMedia: MediaMessagesSendMedia,
    private readonly reactionMessagesSendReaction: ReactionMessagesSendReaction,
  ) {}

  async sendTextMessage(
    sessionId: string,
    to: string,
    text: string,
    quotedMessageId?: string,
  ): Promise<{ messageId: string; textMessageId: string; success: boolean }> {
    const messageId = uuidv4();
    
    try {
      // 1. Create base message record
      await this.messagesCreate.run(
        messageId,
        'out',
        'txt',
        quotedMessageId || null,
        sessionId,
        to,
        new Date(),
      );

      // 2. Send text message and create text message record
      const textResult = await this.textMessagesSendText.run(
        sessionId,
        messageId,
        to,
        text,
        quotedMessageId,
      );

      return {
        messageId,
        textMessageId: textResult.textMessageId,
        success: textResult.success,
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
    const messageId = uuidv4();
    
    try {
      // 1. Create base message record
      await this.messagesCreate.run(
        messageId,
        'out',
        'media',
        quotedMessageId || null,
        sessionId,
        to,
        new Date(),
      );

      // 2. Send media message and create media message record
      const mediaResult = await this.mediaMessagesSendMedia.run(
        sessionId,
        messageId,
        to,
        mediaType,
        mediaUrl,
        caption,
        quotedMessageId,
      );

      return {
        messageId,
        mediaMessageId: mediaResult.mediaMessageId,
        success: mediaResult.success,
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
  ): Promise<{ messageId: string; reactionMessageId: string; success: boolean }> {
    const messageId = uuidv4();
    
    try {
      // 1. Create base message record
      await this.messagesCreate.run(
        messageId,
        'out',
        'react',
        targetMessageId,
        sessionId,
        to,
        new Date(),
      );

      // 2. Send reaction and create reaction message record
      const reactionResult = await this.reactionMessagesSendReaction.run(
        sessionId,
        messageId,
        to,
        messageKey,
        emoji,
        targetMessageId,
      );

      return {
        messageId,
        reactionMessageId: reactionResult.reactionMessageId,
        success: reactionResult.success,
      };
    } catch (error) {
      console.error('Error in sendReaction orchestration:', error);
      throw error;
    }
  }

  async createIncomingTextMessage(
    messageId: string,
    sessionId: string,
    from: string,
    text: string,
    quotedMessageId?: string,
  ): Promise<{ textMessageId: string; success: boolean }> {
    try {
      // 1. Create base message record for incoming message
      await this.messagesCreate.run(
        messageId,
        'in',
        'txt',
        quotedMessageId || null,
        sessionId,
        from,
        new Date(),
      );

      // 2. Create text message record
      const textMessageId = uuidv4();
      await this.textMessagesCreate.run(textMessageId, messageId, text);

      return { textMessageId, success: true };
    } catch (error) {
      console.error('Error creating incoming text message:', error);
      throw error;
    }
  }

  async createIncomingMediaMessage(
    messageId: string,
    sessionId: string,
    from: string,
    mediaType: string,
    mimeType: string,
    fileName: string,
    filePath: string,
    caption?: string,
    quotedMessageId?: string,
  ): Promise<{ mediaMessageId: string; success: boolean }> {
    try {
      // 1. Create base message record for incoming message
      await this.messagesCreate.run(
        messageId,
        'in',
        'media',
        quotedMessageId || null,
        sessionId,
        from,
        new Date(),
      );

      // 2. Create media message record
      const mediaMessageId = uuidv4();
      await this.mediaMessagesCreate.run(
        mediaMessageId,
        messageId,
        caption || null,
        mediaType,
        mimeType,
        fileName,
        filePath,
      );

      return { mediaMessageId, success: true };
    } catch (error) {
      console.error('Error creating incoming media message:', error);
      throw error;
    }
  }

  async createIncomingReaction(
    messageId: string,
    sessionId: string,
    from: string,
    emoji: string,
    targetMessageId: string,
  ): Promise<{ reactionMessageId: string; success: boolean }> {
    try {
      // 1. Create base message record for incoming reaction
      await this.messagesCreate.run(
        messageId,
        'in',
        'react',
        targetMessageId,
        sessionId,
        from,
        new Date(),
      );

      // 2. Create reaction message record
      const reactionMessageId = uuidv4();
      await this.reactionMessagesCreate.run(
        reactionMessageId,
        messageId,
        emoji,
        targetMessageId,
      );

      return { reactionMessageId, success: true };
    } catch (error) {
      console.error('Error creating incoming reaction:', error);
      throw error;
    }
  }
}