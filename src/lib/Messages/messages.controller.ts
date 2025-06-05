import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Inject,
  HttpStatus,
  HttpException,
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';
import { MessagesCreate } from './application/MessagesCreate';
import { MessagesGetAll } from './application/MessagesGetAll';
import { MessagesGetOneById } from './application/MessagesGetOneById';
import { MessagesGetBySessionId } from './application/MessagesGetBySessionId';
import { MessagesUpdate } from './application/MessagesUpdate';
import { MessagesDelete } from './application/MessagesDelete';
import { SendMessage } from './application/SendMessage';
import { SendMessageRequest } from './application/dto/SendMessageRequest.dto';
import { SendMessageResponse } from './application/dto/SendMessageResponse.dto';
import { OutgoingMessageQueue } from './infrastructure/OutgoingMessageQueue';
import { v4 as uuidv4 } from 'uuid';

@Controller('messages')
export class MessagesController {
  constructor(
    @Inject('MessagesCreate')
    private readonly messagesCreate: MessagesCreate,
    @Inject('MessagesGetAll')
    private readonly messagesGetAll: MessagesGetAll,
    @Inject('MessagesGetOneById')
    private readonly messagesGetOneById: MessagesGetOneById,
    @Inject('MessagesGetBySessionId')
    private readonly messagesGetBySessionId: MessagesGetBySessionId,
    @Inject('MessagesUpdate')
    private readonly messagesUpdate: MessagesUpdate,
    @Inject('MessagesDelete')
    private readonly messagesDelete: MessagesDelete,
    @Inject('SendMessage')
    private readonly sendMessage: SendMessage,
    private readonly outgoingMessageQueue: OutgoingMessageQueue,
  ) {}
  @Post()
  async create(
    @Body()
    createMessageDto: {
      session_id: string;
      to: string;
      message_type: string;
      quoted_message_id?: string;
      from_me?: boolean;
    },
  ) {
    try {
      const id = uuidv4();
      const createdAt = new Date();
      await this.messagesCreate.run(
        id,
        null, // No hay baileys_json para mensajes creados manualmente
        createMessageDto.message_type as 'txt' | 'media' | 'react',
        createMessageDto.quoted_message_id || null,
        createMessageDto.session_id,
        createMessageDto.to,
        createMessageDto.from_me ?? false, // Default to false if not provided
        createdAt,
      );
      return {
        success: true,
        data: {
          id,
          session_id: createMessageDto.session_id,
          to: createMessageDto.to,
          message_type: createMessageDto.message_type,
          quoted_message_id: createMessageDto.quoted_message_id,
          created_at: createdAt,
        },
        message: 'Message created successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get()
  async findAll(@Query('session_id') sessionId?: string) {
    try {
      let messages;
      if (sessionId) {
        messages = await this.messagesGetBySessionId.run(sessionId);
      } else {
        messages = await this.messagesGetAll.run();
      }

      return {
        success: true,
        data: messages,
        message: 'Messages retrieved successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const message = await this.messagesGetOneById.run(id);
      if (!message) {
        throw new HttpException(
          {
            success: false,
            message: 'Message not found',
          },
          HttpStatus.NOT_FOUND,
        );
      }
      return {
        success: true,
        data: message,
        message: 'Message retrieved successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message,
        },
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body()
    updateMessageDto: {
      session_id?: string;
      to?: string;
      message_type?: string;
      quoted_message_id?: string;
      from_me?: boolean;
    },
  ) {
    try {
      // First get the existing message
      const existingMessage = await this.messagesGetOneById.run(id);
      if (!existingMessage) {
        throw new HttpException(
          {
            success: false,
            message: 'Message not found',
          },
          HttpStatus.NOT_FOUND,
        );
      }
      await this.messagesUpdate.run(
        id,
        existingMessage.baileys_json?.value || null,
        (updateMessageDto.message_type as 'txt' | 'media' | 'react') ||
          existingMessage.message_type.value,
        updateMessageDto.quoted_message_id ||
          existingMessage.quoted_message_id.value,
        updateMessageDto.session_id || existingMessage.session_id.value,
        updateMessageDto.to || existingMessage.to.value,
        updateMessageDto.from_me ?? existingMessage.from_me.value,
        existingMessage.created_at.value,
      );

      const updatedMessage = await this.messagesGetOneById.run(id);
      return {
        success: true,
        data: updatedMessage,
        message: 'Message updated successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      await this.messagesDelete.run(id);
      return {
        success: true,
        message: 'Message deleted successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // --- Separated WhatsApp Message Sending Endpoints ---

  @Post('send-text')
  @UsePipes(new ValidationPipe({ transform: true }))
  async sendTextMessage(
    @Body() request: SendMessageRequest,
  ): Promise<SendMessageResponse> {
    try {
      const messageId = uuidv4();
      if (!request.textData?.text) {
        throw new Error('Text data is required for text messages');
      }
      const messageData: any = {
        to: `${request.to}@s.whatsapp.net`,
        content: request.textData.text,
      };
      if (request.quotedMessageId) {
        messageData.quotedMessageId = request.quotedMessageId;
      }
      await this.outgoingMessageQueue.addMessage({
        sessionId: request.sessionId,
        messageType: 'text',
        messageData,
        priority: 'normal',
        retryCount: 3,
      });
      console.log(
        `📤 [${request.sessionId}] text message queued for ${request.to}`,
      );
      return {
        success: true,
        messageId,
        message: 'text message queued successfully',
        messageType: 'text',
        queued: true,
        timestamp: new Date(),
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message,
          messageType: 'text',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('send-media')
  @UsePipes(new ValidationPipe({ transform: true }))
  async sendMediaMessage(
    @Body() request: SendMessageRequest,
  ): Promise<SendMessageResponse> {
    try {
      const messageId = uuidv4();
      if (!request.mediaData?.url) {
        throw new Error('Media data is required for media messages');
      }
      const messageData: any = {
        to: `${request.to}@s.whatsapp.net`,
        content: request.mediaData.url,
        mediaType: request.mediaData.mediaType,
        fileName: request.mediaData.fileName,
        caption: request.mediaData.caption,
      };
      if (request.quotedMessageId) {
        messageData.quotedMessageId = request.quotedMessageId;
      }
      await this.outgoingMessageQueue.addMessage({
        sessionId: request.sessionId,
        messageType: 'media',
        messageData,
        priority: 'normal',
        retryCount: 3,
      });
      console.log(
        `📤 [${request.sessionId}] media message queued for ${request.to}`,
      );
      return {
        success: true,
        messageId,
        message: 'media message queued successfully',
        messageType: 'media',
        queued: true,
        timestamp: new Date(),
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message,
          messageType: 'media',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('send-reaction')
  @UsePipes(new ValidationPipe({ transform: true }))
  async sendReactionMessage(
    @Body() request: SendMessageRequest,
  ): Promise<SendMessageResponse> {
    try {
      const messageId = uuidv4();
      if (!request.reactionData?.emoji) {
        throw new Error('Reaction data is required for reaction messages');
      }
      const messageData: any = {
        to: `${request.to}@s.whatsapp.net`,
        content: request.reactionData.emoji,
        emoji: request.reactionData.emoji,
        targetMessageId: request.reactionData.targetMessageId,
      };
      await this.outgoingMessageQueue.addMessage({
        sessionId: request.sessionId,
        messageType: 'reaction',
        messageData,
        priority: 'high',
        retryCount: 3,
      });
      console.log(
        `📤 [${request.sessionId}] reaction message queued for ${request.to}`,
      );
      return {
        success: true,
        messageId,
        message: 'reaction message queued successfully',
        messageType: 'reaction',
        queued: true,
        timestamp: new Date(),
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message,
          messageType: 'reaction',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
