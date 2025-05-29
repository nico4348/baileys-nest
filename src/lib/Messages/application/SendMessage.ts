import { Injectable } from '@nestjs/common';
import { SendMessageRequest, MessageType } from './dto/SendMessageRequest.dto';
import { SendMessageResponse } from './dto/SendMessageResponse.dto';
import { MessagesOrchestrator } from './MessagesOrchestrator';

@Injectable()
export class SendMessage {
  constructor(private readonly messagesOrchestrator: MessagesOrchestrator) {}

  async run(request: SendMessageRequest): Promise<SendMessageResponse> {
    try {
      this.validateRequest(request);

      switch (request.messageType) {
        case MessageType.TEXT:
          return await this.sendTextMessage(request);

        case MessageType.MEDIA:
          return await this.sendMediaMessage(request);

        case MessageType.REACTION:
          return await this.sendReactionMessage(request);

        default:
          throw new Error(`Unsupported message type: ${request.messageType}`);
      }
    } catch (error) {
      console.error('Error in SendMessage:', error);
      return SendMessageResponse.error(
        error.message || 'Unknown error occurred',
        request.messageType,
      );
    }
  }

  private validateRequest(request: SendMessageRequest): void {
    switch (request.messageType) {
      case MessageType.TEXT:
        if (!request.textData || !request.textData.text) {
          throw new Error('Text data is required for text messages');
        }
        break;

      case MessageType.MEDIA:
        if (
          !request.mediaData ||
          !request.mediaData.url ||
          !request.mediaData.mediaType
        ) {
          throw new Error(
            'Media data with url and mediaType is required for media messages',
          );
        }
        break;
      case MessageType.REACTION:
        if (
          !request.reactionData ||
          !request.reactionData.emoji ||
          !request.reactionData.targetMessageId
        ) {
          throw new Error(
            'Reaction data with emoji and targetMessageId is required for reaction messages',
          );
        }
        break;
    }
  }

  private async sendTextMessage(
    request: SendMessageRequest,
  ): Promise<SendMessageResponse> {
    const result = await this.messagesOrchestrator.sendTextMessage(
      request.sessionId,
      request.to,
      request.textData!.text,
      request.quotedMessageId,
    );

    const messageId = result?.key?.id;
    if (!messageId) {
      throw new Error('Failed to send text message');
    }

    return SendMessageResponse.success(messageId, MessageType.TEXT, messageId);
  }

  private async sendMediaMessage(
    request: SendMessageRequest,
  ): Promise<SendMessageResponse> {
    const result = await this.messagesOrchestrator.sendMediaMessage(
      request.sessionId,
      request.to,
      request.mediaData!.mediaType,
      request.mediaData!.url,
      request.mediaData!.caption,
      request.quotedMessageId,
    );

    const messageId = result?.key?.id;
    if (!messageId) {
      throw new Error('Failed to send media message');
    }

    return SendMessageResponse.success(messageId, MessageType.MEDIA, messageId);
  }
  private async sendReactionMessage(
    request: SendMessageRequest,
  ): Promise<SendMessageResponse> {
    let messageKey;
    let targetMessageId;

    // Si targetMessageId es un objeto con estructura completa, extraer la info
    if (
      typeof request.reactionData!.targetMessageId === 'object' &&
      request.reactionData!.targetMessageId.key
    ) {
      const targetData = request.reactionData!.targetMessageId;
      messageKey = targetData.key;
      targetMessageId = targetData.key.id;
    } else if (typeof request.reactionData!.targetMessageId === 'string') {
      // Si es solo el ID como string, crear el messageKey
      targetMessageId = request.reactionData!.targetMessageId;
      messageKey = request.reactionData!.messageKey || {
        remoteJid: `${request.to}@s.whatsapp.net`,
        fromMe: false,
        id: targetMessageId,
        participant: undefined,
      };
    } else {
      throw new Error('Invalid targetMessageId format');
    }

    const result = await this.messagesOrchestrator.sendReaction(
      request.sessionId,
      request.to,
      messageKey,
      request.reactionData!.emoji,
      targetMessageId,
    );

    const messageId = result?.key?.id;
    if (!messageId) {
      throw new Error('Failed to send reaction');
    }

    return SendMessageResponse.success(
      messageId,
      MessageType.REACTION,
      messageId,
    );
  }
}
