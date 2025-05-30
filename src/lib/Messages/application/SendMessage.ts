import { Injectable } from '@nestjs/common';
import { SendMessageRequest, MessageType } from './dto/SendMessageRequest.dto';
import { SendMessageResponse } from './dto/SendMessageResponse.dto';
import { MessagesOrchestrator } from './MessagesOrchestrator';
import { CryptoService } from '../domain/ports/CryptoService';

@Injectable()
export class SendMessage {
  constructor(
    private readonly messagesOrchestrator: MessagesOrchestrator,
    private readonly cryptoService: CryptoService,
  ) {}
  async run(request: SendMessageRequest): Promise<SendMessageResponse> {
    // Generate UUID upfront for the entire flow
    const messageUuid = this.cryptoService.generateUUID();

    try {
      // Validate request (DTO/VO validations)
      this.validateRequest(request);

      // Continue with message sending based on type
      // Status creation will happen in MessagesOrchestrator after message creation
      switch (request.messageType) {
        case MessageType.TEXT:
          return await this.sendTextMessage(request, messageUuid);

        case MessageType.MEDIA:
          return await this.sendMediaMessage(request, messageUuid);

        case MessageType.REACTION:
          return await this.sendReactionMessage(request, messageUuid);

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
    messageUuid: string,
  ): Promise<SendMessageResponse> {
    const result = await this.messagesOrchestrator.sendTextMessage(
      request.sessionId,
      request.to,
      request.textData!.text,
      request.quotedMessageId,
      messageUuid, // Pass the predefined UUID
    );

    const baileysMessageId = result?.baileysMessage?.key?.id;
    const uuid = result?.uuid;

    if (!baileysMessageId || !uuid) {
      throw new Error('Failed to send text message');
    }

    return SendMessageResponse.success(
      uuid,
      MessageType.TEXT,
      baileysMessageId,
    );
  }
  private async sendMediaMessage(
    request: SendMessageRequest,
    messageUuid: string,
  ): Promise<SendMessageResponse> {
    const result = await this.messagesOrchestrator.sendMediaMessage(
      request.sessionId,
      request.to,
      request.mediaData!.mediaType,
      request.mediaData!.url,
      request.mediaData!.caption,
      request.quotedMessageId,
      messageUuid, // Pass the predefined UUID
    );

    const baileysMessageId = result?.baileysMessage?.key?.id;
    const uuid = result?.uuid;

    if (!baileysMessageId || !uuid) {
      throw new Error('Failed to send media message');
    }

    return SendMessageResponse.success(
      uuid,
      MessageType.MEDIA,
      baileysMessageId,
    );
  }
  private async sendReactionMessage(
    request: SendMessageRequest,
    messageUuid: string,
  ): Promise<SendMessageResponse> {
    let messageKey: any;
    let targetMessageId: string;

    // Si targetMessageId es un objeto completo con clave de Baileys
    if (
      typeof request.reactionData!.targetMessageId === 'object' &&
      request.reactionData!.targetMessageId.key
    ) {
      const targetData = request.reactionData!.targetMessageId;
      messageKey = targetData.key;
      targetMessageId = targetData.key.id;
    } else if (typeof request.reactionData!.targetMessageId === 'string') {
      // Si recibe UUID de mensaje, obtener la clave de Baileys guardada
      const uuid = request.reactionData!.targetMessageId;
      targetMessageId = uuid;
      messageKey = request.reactionData!.messageKey
        ? request.reactionData!.messageKey
        : await this.messagesOrchestrator.getMessageBaileysKey(uuid);
    } else {
      throw new Error('Invalid targetMessageId format');
    }
    const result = await this.messagesOrchestrator.sendReaction(
      request.sessionId,
      request.to,
      messageKey,
      request.reactionData!.emoji,
      targetMessageId,
      messageUuid, // Pass the predefined UUID
    );

    const baileysMessageId = result?.baileysMessage?.key?.id;
    const uuid = result?.uuid;

    if (!baileysMessageId || !uuid) {
      throw new Error('Failed to send reaction');
    }

    return SendMessageResponse.success(
      uuid,
      MessageType.REACTION,
      baileysMessageId,
    );
  }
}
