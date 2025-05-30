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
import { ReactionMessagesCreate } from './application/ReactionMessagesCreate';
import { ReactionMessagesGetAll } from './application/ReactionMessagesGetAll';
import { ReactionMessagesGetOneById } from './application/ReactionMessagesGetOneById';
import { ReactionMessagesGetByMessageId } from './application/ReactionMessagesGetByMessageId';
import { ReactionMessagesGetByTargetMessageId } from './application/ReactionMessagesGetByTargetMessageId';
import { ReactionMessagesGetBySessionId } from './application/ReactionMessagesGetBySessionId';
import { ReactionMessagesGetByEmoji } from './application/ReactionMessagesGetByEmoji';
import { ReactionMessagesUpdate } from './application/ReactionMessagesUpdate';
import { ReactionMessagesDelete } from './application/ReactionMessagesDelete';
import { v4 as uuidv4 } from 'uuid';

@Controller('reaction-messages')
export class ReactionMessagesController {
  constructor(
    @Inject('ReactionMessagesCreate')
    private readonly reactionMessagesCreate: ReactionMessagesCreate,
    @Inject('ReactionMessagesGetAll')
    private readonly reactionMessagesGetAll: ReactionMessagesGetAll,
    @Inject('ReactionMessagesGetOneById')
    private readonly reactionMessagesGetOneById: ReactionMessagesGetOneById,
    @Inject('ReactionMessagesGetByMessageId')
    private readonly reactionMessagesGetByMessageId: ReactionMessagesGetByMessageId,
    @Inject('ReactionMessagesGetByTargetMessageId')
    private readonly reactionMessagesGetByTargetMessageId: ReactionMessagesGetByTargetMessageId,
    @Inject('ReactionMessagesGetBySessionId')
    private readonly reactionMessagesGetBySessionId: ReactionMessagesGetBySessionId,
    @Inject('ReactionMessagesGetByEmoji')
    private readonly reactionMessagesGetByEmoji: ReactionMessagesGetByEmoji,
    @Inject('ReactionMessagesUpdate')
    private readonly reactionMessagesUpdate: ReactionMessagesUpdate,
    @Inject('ReactionMessagesDelete')
    private readonly reactionMessagesDelete: ReactionMessagesDelete,
  ) {}
  @Post()
  async create(
    @Body()
    createReactionMessageDto: {
      message_id: string;
      emoji: string;
      target_msg_id: string;
    },
  ) {
    try {
      await this.reactionMessagesCreate.run(
        createReactionMessageDto.message_id,
        createReactionMessageDto.emoji,
        createReactionMessageDto.target_msg_id,
      );
      return {
        success: true,
        data: {
          message_id: createReactionMessageDto.message_id,
          emoji: createReactionMessageDto.emoji,
          target_msg_id: createReactionMessageDto.target_msg_id,
        },
        message: 'Reaction message created successfully',
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
    @Query('target_message_id') targetMessageId?: string,
    @Query('session_id') sessionId?: string,
    @Query('emoji') emoji?: string,
  ) {
    try {
      let reactionMessages;
      if (messageId) {
        reactionMessages =
          await this.reactionMessagesGetByMessageId.run(messageId);
      } else if (targetMessageId) {
        reactionMessages =
          await this.reactionMessagesGetByTargetMessageId.run(targetMessageId);
      } else if (sessionId) {
        reactionMessages =
          await this.reactionMessagesGetBySessionId.run(sessionId);
      } else if (emoji) {
        reactionMessages = await this.reactionMessagesGetByEmoji.run(emoji);
      } else {
        reactionMessages = await this.reactionMessagesGetAll.run();
      }

      return {
        success: true,
        data: reactionMessages,
        message: 'Reaction messages retrieved successfully',
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
      const reactionMessage = await this.reactionMessagesGetOneById.run(id);
      if (!reactionMessage) {
        throw new HttpException(
          {
            success: false,
            message: 'Reaction message not found',
          },
          HttpStatus.NOT_FOUND,
        );
      }
      return {
        success: true,
        data: reactionMessage,
        message: 'Reaction message retrieved successfully',
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
    updateReactionMessageDto: {
      message_id?: string;
      emoji?: string;
      target_msg_id?: string;
    },
  ) {
    try {
      // First get the existing reaction message
      const existingReactionMessage =
        await this.reactionMessagesGetOneById.run(id);
      if (!existingReactionMessage) {
        throw new HttpException(
          {
            success: false,
            message: 'Reaction message not found',
          },
          HttpStatus.NOT_FOUND,
        );
      }
      await this.reactionMessagesUpdate.run(
        updateReactionMessageDto.message_id ||
          existingReactionMessage.message_id.value,
        updateReactionMessageDto.emoji || existingReactionMessage.emoji.value,
        updateReactionMessageDto.target_msg_id ||
          existingReactionMessage.target_msg_id.value,
      );

      const updatedReactionMessage =
        await this.reactionMessagesGetOneById.run(id);
      return {
        success: true,
        data: updatedReactionMessage,
        message: 'Reaction message updated successfully',
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
      await this.reactionMessagesDelete.run(id);
      return {
        success: true,
        message: 'Reaction message deleted successfully',
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
