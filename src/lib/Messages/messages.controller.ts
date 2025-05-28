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
} from '@nestjs/common';
import { MessagesCreate } from './application/MessagesCreate';
import { MessagesGetAll } from './application/MessagesGetAll';
import { MessagesGetOneById } from './application/MessagesGetOneById';
import { MessagesGetBySessionId } from './application/MessagesGetBySessionId';
import { MessagesUpdate } from './application/MessagesUpdate';
import { MessagesDelete } from './application/MessagesDelete';
import { MessagesOrchestrator } from './application/MessagesOrchestrator';
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
    @Inject('MessagesOrchestrator')
    private readonly messagesOrchestrator: MessagesOrchestrator,
  ) {}

  @Post()
  async create(
    @Body()
    createMessageDto: {
      session_id: string;
      to: string;
      message_type: string;
      in_out: string;
      quoted_message_id?: string;
    },
  ) {
    try {
      const id = uuidv4();
      const createdAt = new Date();
      await this.messagesCreate.run(
        id,
        createMessageDto.in_out as 'in' | 'out',
        createMessageDto.message_type as 'txt' | 'media' | 'react',
        createMessageDto.quoted_message_id || null,
        createMessageDto.session_id,
        createMessageDto.to,
        createdAt,
      );
      return {
        success: true,
        data: {
          id,
          session_id: createMessageDto.session_id,
          to: createMessageDto.to,
          message_type: createMessageDto.message_type,
          in_out: createMessageDto.in_out,
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
      in_out?: string;
      quoted_message_id?: string;
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
        (updateMessageDto.in_out as 'in' | 'out') ||
          existingMessage.in_out.value,
        (updateMessageDto.message_type as 'txt' | 'media' | 'react') ||
          existingMessage.message_type.value,
        updateMessageDto.quoted_message_id ||
          existingMessage.quoted_message_id.value,
        updateMessageDto.session_id || existingMessage.session_id.value,
        updateMessageDto.to || existingMessage.to.value,
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

  // WhatsApp Message Sending Endpoints

  @Post('send/text')
  async sendTextMessage(
    @Body()
    sendTextDto: {
      session_id: string;
      to: string;
      text: string;
      quoted_message_id?: string;
    },
  ) {
    try {
      const result = await this.messagesOrchestrator.sendTextMessage(
        sendTextDto.session_id,
        sendTextDto.to,
        sendTextDto.text,
        sendTextDto.quoted_message_id,
      );

      return {
        success: true,
        data: result,
        message: 'Text message sent successfully',
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

  @Post('send/media')
  async sendMediaMessage(
    @Body()
    sendMediaDto: {
      session_id: string;
      to: string;
      media_type: string;
      media_url: string;
      caption?: string;
      quoted_message_id?: string;
    },
  ) {
    try {
      const result = await this.messagesOrchestrator.sendMediaMessage(
        sendMediaDto.session_id,
        sendMediaDto.to,
        sendMediaDto.media_type,
        sendMediaDto.media_url,
        sendMediaDto.caption,
        sendMediaDto.quoted_message_id,
      );

      return {
        success: true,
        data: result,
        message: 'Media message sent successfully',
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

  @Post('send/reaction')
  async sendReaction(
    @Body()
    sendReactionDto: {
      session_id: string;
      to: string;
      message_key: any;
      emoji: string;
      target_message_id: string;
    },
  ) {
    try {
      const result = await this.messagesOrchestrator.sendReaction(
        sendReactionDto.session_id,
        sendReactionDto.to,
        sendReactionDto.message_key,
        sendReactionDto.emoji,
        sendReactionDto.target_message_id,
      );

      return {
        success: true,
        data: result,
        message: 'Reaction sent successfully',
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
}