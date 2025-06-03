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
import { MediaMessagesCreate } from './application/MediaMessagesCreate';
import { MediaMessagesGetAll } from './application/MediaMessagesGetAll';
import { MediaMessagesGetOneById } from './application/MediaMessagesGetOneById';
import { MediaMessagesGetByMessageId } from './application/MediaMessagesGetByMessageId';
import { MediaMessagesGetBySessionId } from './application/MediaMessagesGetBySessionId';
import { MediaMessagesGetByMediaType } from './application/MediaMessagesGetByMediaType';
import { MediaMessagesUpdate } from './application/MediaMessagesUpdate';
import { MediaMessagesDelete } from './application/MediaMessagesDelete';
import { DownloadMediaMessage } from './application/DownloadMediaMessage';
import { v4 as uuidv4 } from 'uuid';

@Controller('media-messages')
export class MediaMessagesController {
  constructor(
    @Inject('MediaMessagesCreate')
    private readonly mediaMessagesCreate: MediaMessagesCreate,
    @Inject('MediaMessagesGetAll')
    private readonly mediaMessagesGetAll: MediaMessagesGetAll,
    @Inject('MediaMessagesGetOneById')
    private readonly mediaMessagesGetOneById: MediaMessagesGetOneById,
    @Inject('MediaMessagesGetByMessageId')
    private readonly mediaMessagesGetByMessageId: MediaMessagesGetByMessageId,
    @Inject('MediaMessagesGetBySessionId')
    private readonly mediaMessagesGetBySessionId: MediaMessagesGetBySessionId,
    @Inject('MediaMessagesGetByMediaType')
    private readonly mediaMessagesGetByMediaType: MediaMessagesGetByMediaType,
    @Inject('MediaMessagesUpdate')
    private readonly mediaMessagesUpdate: MediaMessagesUpdate,
    @Inject('MediaMessagesDelete')
    private readonly mediaMessagesDelete: MediaMessagesDelete,
    @Inject('DownloadMediaMessage')
    private readonly downloadMediaMessage: DownloadMediaMessage,
  ) {}
  @Post()
  async create(
    @Body()
    createMediaMessageDto: {
      message_id: string;
      caption?: string;
      media_type: string;
      mime_type: string;
      file_name: string;
      file_path: string;
    },
  ) {
    try {
      await this.mediaMessagesCreate.run(
        createMediaMessageDto.message_id,
        createMediaMessageDto.caption || null,
        createMediaMessageDto.media_type,
        createMediaMessageDto.mime_type,
        createMediaMessageDto.file_name,
        createMediaMessageDto.file_path,
      );
      return {
        success: true,
        data: {
          message_id: createMediaMessageDto.message_id,
          caption: createMediaMessageDto.caption,
          media_type: createMediaMessageDto.media_type,
          mime_type: createMediaMessageDto.mime_type,
          file_name: createMediaMessageDto.file_name,
          file_path: createMediaMessageDto.file_path,
        },
        message: 'Media message created successfully',
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
    @Query('media_type') mediaType?: string,
  ) {
    try {
      let mediaMessages;
      if (messageId) {
        const mediaMessage =
          await this.mediaMessagesGetByMessageId.run(messageId);
        mediaMessages = mediaMessage ? [mediaMessage] : [];
      } else if (sessionId) {
        mediaMessages = await this.mediaMessagesGetBySessionId.run(sessionId);
      } else if (mediaType) {
        mediaMessages = await this.mediaMessagesGetByMediaType.run(mediaType);
      } else {
        mediaMessages = await this.mediaMessagesGetAll.run();
      }

      return {
        success: true,
        data: mediaMessages,
        message: 'Media messages retrieved successfully',
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
      const mediaMessage = await this.mediaMessagesGetOneById.run(id);
      if (!mediaMessage) {
        throw new HttpException(
          {
            success: false,
            message: 'Media message not found',
          },
          HttpStatus.NOT_FOUND,
        );
      }
      return {
        success: true,
        data: mediaMessage,
        message: 'Media message retrieved successfully',
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
    updateMediaMessageDto: {
      message_id?: string;
      caption?: string;
      media_type?: string;
      mime_type?: string;
      file_name?: string;
      file_path?: string;
    },
  ) {
    try {
      // First get the existing media message
      const existingMediaMessage = await this.mediaMessagesGetOneById.run(id);
      if (!existingMediaMessage) {
        throw new HttpException(
          {
            success: false,
            message: 'Media message not found',
          },
          HttpStatus.NOT_FOUND,
        );
      }
      await this.mediaMessagesUpdate.run(
        updateMediaMessageDto.message_id ||
          existingMediaMessage.message_id.value,
        updateMediaMessageDto.caption !== undefined
          ? updateMediaMessageDto.caption
          : existingMediaMessage.caption.value,
        updateMediaMessageDto.media_type ||
          existingMediaMessage.media_type.value,
        updateMediaMessageDto.mime_type || existingMediaMessage.mime_type.value,
        updateMediaMessageDto.file_name || existingMediaMessage.file_name.value,
        updateMediaMessageDto.file_path || existingMediaMessage.file_path.value,
      );

      const updatedMediaMessage = await this.mediaMessagesGetOneById.run(id);
      return {
        success: true,
        data: updatedMediaMessage,
        message: 'Media message updated successfully',
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
      await this.mediaMessagesDelete.run(id);
      return {
        success: true,
        message: 'Media message deleted successfully',
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

  @Post(':id/download')
  async downloadMedia(
    @Param('id') id: string,
    @Body() body: { sessionId: string; uploadToS3?: boolean }
  ) {
    try {
      const result = await this.downloadMediaMessage.run(
        id,
        body.sessionId,
        body.uploadToS3 || false
      );

      return {
        success: true,
        data: result,
        message: body.uploadToS3 
          ? 'Media downloaded and uploaded to S3 successfully' 
          : 'Media downloaded successfully',
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
