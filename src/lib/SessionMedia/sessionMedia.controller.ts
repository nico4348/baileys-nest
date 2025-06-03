import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { SessionMediaCreate, CreateSessionMediaRequest } from './application/SessionMediaCreate';
import { SessionMediaGetAll } from './application/SessionMediaGetAll';
import { SessionMediaGetOneById } from './application/SessionMediaGetOneById';
import { SessionMediaGetBySessionId } from './application/SessionMediaGetBySessionId';
import { SessionMediaUpdate, UpdateSessionMediaRequest } from './application/SessionMediaUpdate';
import { SessionMediaDelete } from './application/SessionMediaDelete';
import { S3PresignedUrlService, PresignedUrlRequest } from './infrastructure/S3PresignedUrlService';

@Controller('session-media')
export class SessionMediaController {
  constructor(
    private readonly sessionMediaCreate: SessionMediaCreate,
    private readonly sessionMediaGetAll: SessionMediaGetAll,
    private readonly sessionMediaGetOneById: SessionMediaGetOneById,
    private readonly sessionMediaGetBySessionId: SessionMediaGetBySessionId,
    private readonly sessionMediaUpdate: SessionMediaUpdate,
    private readonly sessionMediaDelete: SessionMediaDelete,
    private readonly s3PresignedUrlService: S3PresignedUrlService,
  ) {}

  @Post('presigned-url')
  async generatePresignedUrl(@Body() request: PresignedUrlRequest) {
    return await this.s3PresignedUrlService.generatePresignedUrl(request);
  }

  @Post()
  async create(@Body() request: CreateSessionMediaRequest) {
    const sessionMedia = await this.sessionMediaCreate.execute(request);
    return {
      id: sessionMedia.getId().toString(),
      sessionId: sessionMedia.getSessionId().toString(),
      s3Url: sessionMedia.getS3Url().toString(),
      fileName: sessionMedia.getFileName().toString(),
      mediaType: sessionMedia.getMediaType().toString(),
      description: sessionMedia.getDescription().toString(),
      createdAt: sessionMedia.getCreatedAt().toDate(),
    };
  }

  @Get()
  async getAll(@Query('sessionId') sessionId?: string) {
    if (sessionId) {
      const sessionMediaList = await this.sessionMediaGetBySessionId.execute(sessionId);
      return sessionMediaList.map((sessionMedia) => ({
        id: sessionMedia.getId().toString(),
        sessionId: sessionMedia.getSessionId().toString(),
        s3Url: sessionMedia.getS3Url().toString(),
        fileName: sessionMedia.getFileName().toString(),
        mediaType: sessionMedia.getMediaType().toString(),
        description: sessionMedia.getDescription().toString(),
        createdAt: sessionMedia.getCreatedAt().toDate(),
      }));
    }

    const sessionMediaList = await this.sessionMediaGetAll.execute();
    return sessionMediaList.map((sessionMedia) => ({
      id: sessionMedia.getId().toString(),
      sessionId: sessionMedia.getSessionId().toString(),
      s3Url: sessionMedia.getS3Url().toString(),
      fileName: sessionMedia.getFileName().toString(),
      mediaType: sessionMedia.getMediaType().toString(),
      description: sessionMedia.getDescription().toString(),
      createdAt: sessionMedia.getCreatedAt().toDate(),
    }));
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    const sessionMedia = await this.sessionMediaGetOneById.execute(id);
    return {
      id: sessionMedia.getId().toString(),
      sessionId: sessionMedia.getSessionId().toString(),
      s3Url: sessionMedia.getS3Url().toString(),
      fileName: sessionMedia.getFileName().toString(),
      mediaType: sessionMedia.getMediaType().toString(),
      description: sessionMedia.getDescription().toString(),
      createdAt: sessionMedia.getCreatedAt().toDate(),
    };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() request: Omit<UpdateSessionMediaRequest, 'id'>) {
    const sessionMedia = await this.sessionMediaUpdate.execute({ ...request, id });
    return {
      id: sessionMedia.getId().toString(),
      sessionId: sessionMedia.getSessionId().toString(),
      s3Url: sessionMedia.getS3Url().toString(),
      fileName: sessionMedia.getFileName().toString(),
      mediaType: sessionMedia.getMediaType().toString(),
      description: sessionMedia.getDescription().toString(),
      createdAt: sessionMedia.getCreatedAt().toDate(),
    };
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.sessionMediaDelete.execute(id);
    return { message: 'SessionMedia deleted successfully' };
  }
}