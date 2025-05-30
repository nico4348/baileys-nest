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
import { TextMessagesCreate } from './application/TextMessagesCreate';
import { TextMessagesGetAll } from './application/TextMessagesGetAll';
import { TextMessagesGetOneById } from './application/TextMessagesGetOneById';
import { TextMessagesGetByMessageId } from './application/TextMessagesGetByMessageId';
import { TextMessagesGetBySessionId } from './application/TextMessagesGetBySessionId';
import { TextMessagesUpdate } from './application/TextMessagesUpdate';
import { TextMessagesDelete } from './application/TextMessagesDelete';
import { v4 as uuidv4 } from 'uuid';

@Controller('text-messages')
export class TextMessagesController {
  constructor(
    @Inject('TextMessagesCreate')
    private readonly textMessagesCreate: TextMessagesCreate,
    @Inject('TextMessagesGetAll')
    private readonly textMessagesGetAll: TextMessagesGetAll,
    @Inject('TextMessagesGetOneById')
    private readonly textMessagesGetOneById: TextMessagesGetOneById,
    @Inject('TextMessagesGetByMessageId')
    private readonly textMessagesGetByMessageId: TextMessagesGetByMessageId,
    @Inject('TextMessagesGetBySessionId')
    private readonly textMessagesGetBySessionId: TextMessagesGetBySessionId,
    @Inject('TextMessagesUpdate')
    private readonly textMessagesUpdate: TextMessagesUpdate,
    @Inject('TextMessagesDelete')
    private readonly textMessagesDelete: TextMessagesDelete,
  ) {}

  @Post() async create(
    @Body()
    createTextMessageDto: {
      message_id: string;
      body: string;
    },
  ) {
    try {
      await this.textMessagesCreate.run(
        createTextMessageDto.message_id,
        createTextMessageDto.body,
      );
      return {
        success: true,
        data: {
          message_id: createTextMessageDto.message_id,
          body: createTextMessageDto.body,
        },
        message: 'Text message created successfully',
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
  async findAll(
    @Query('message_id') messageId?: string,
    @Query('session_id') sessionId?: string,
  ) {
    try {
      let textMessages;
      if (messageId) {
        const textMessage =
          await this.textMessagesGetByMessageId.run(messageId);
        textMessages = textMessage ? [textMessage] : [];
      } else if (sessionId) {
        textMessages = await this.textMessagesGetBySessionId.run(sessionId);
      } else {
        textMessages = await this.textMessagesGetAll.run();
      }

      return {
        success: true,
        data: textMessages,
        message: 'Text messages retrieved successfully',
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
      const textMessage = await this.textMessagesGetOneById.run(id);
      if (!textMessage) {
        throw new HttpException(
          {
            success: false,
            message: 'Text message not found',
          },
          HttpStatus.NOT_FOUND,
        );
      }
      return {
        success: true,
        data: textMessage,
        message: 'Text message retrieved successfully',
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
    updateTextMessageDto: {
      message_id?: string;
      body?: string;
    },
  ) {
    try {
      // First get the existing text message
      const existingTextMessage = await this.textMessagesGetOneById.run(id);
      if (!existingTextMessage) {
        throw new HttpException(
          {
            success: false,
            message: 'Text message not found',
          },
          HttpStatus.NOT_FOUND,
        );
      }
      await this.textMessagesUpdate.run(
        updateTextMessageDto.message_id || existingTextMessage.message_id.value,
        updateTextMessageDto.body || existingTextMessage.body.value,
      );

      const updatedTextMessage = await this.textMessagesGetOneById.run(id);
      return {
        success: true,
        data: updatedTextMessage,
        message: 'Text message updated successfully',
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
      await this.textMessagesDelete.run(id);
      return {
        success: true,
        message: 'Text message deleted successfully',
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
