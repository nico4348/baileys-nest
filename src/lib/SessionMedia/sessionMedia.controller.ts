import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseInterceptors,
  UploadedFile,
  HttpStatus,
  HttpCode,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SessionMediaCreate, CreateSessionMediaRequest } from './application/SessionMediaCreate';
import { SessionMediaGetAll } from './application/SessionMediaGetAll';
import { SessionMediaGetOneById } from './application/SessionMediaGetOneById';
import { SessionMediaGetBySessionId } from './application/SessionMediaGetBySessionId';
import { SessionMediaUpdate, UpdateSessionMediaRequest } from './application/SessionMediaUpdate';
import { SessionMediaDelete } from './application/SessionMediaDelete';
import { FileUploadQueue } from './infrastructure/FileUploadQueue';
import { FileStorage } from './infrastructure/FileStorage';
import { UploadFileRequestDto } from './dto/UploadFileRequest.dto';

@Controller('session-media')
export class SessionMediaController {
  constructor(
    private readonly sessionMediaCreate: SessionMediaCreate,
    private readonly sessionMediaGetAll: SessionMediaGetAll,
    private readonly sessionMediaGetOneById: SessionMediaGetOneById,
    private readonly sessionMediaGetBySessionId: SessionMediaGetBySessionId,
    private readonly sessionMediaUpdate: SessionMediaUpdate,
    private readonly sessionMediaDelete: SessionMediaDelete,
    private readonly fileUploadQueue: FileUploadQueue,
    private readonly fileStorage: FileStorage,
  ) {}


  @Post('upload')
  @HttpCode(HttpStatus.ACCEPTED)
  @UseInterceptors(FileInterceptor('file'))
  @UsePipes(new ValidationPipe({ transform: true }))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadRequest: UploadFileRequestDto,
  ) {
    try {
      if (!file) {
        throw new Error('No file provided');
      }

      if (!uploadRequest.sessionId) {
        throw new Error('Session ID is required');
      }

      const sessionMedia = await this.sessionMediaCreate.execute({
        sessionId: uploadRequest.sessionId,
        s3Url: '',
        fileName: file.originalname,
        mediaType: file.mimetype,
        description: uploadRequest.description,
        isUploaded: false,
      });

      await this.fileStorage.storeTemporaryFile(
        sessionMedia.getId().toString(),
        file.buffer
      );

      await this.fileUploadQueue.addFileUpload({
        sessionMediaId: sessionMedia.getId().toString(),
        fileBuffer: file.buffer,
        fileName: file.originalname,
        mediaType: file.mimetype,
        sessionId: uploadRequest.sessionId,
      });
      return {
        id: sessionMedia.getId().toString(),
        status: 'accepted',
        message: 'File queued for upload',
      };
    } catch (error) {
      console.error('Error in upload endpoint:', error);
      throw error;
    }
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
      isUploaded: sessionMedia.getIsUploaded().toBoolean(),
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
      isUploaded: sessionMedia.getIsUploaded().toBoolean(),
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
      isUploaded: sessionMedia.getIsUploaded().toBoolean(),
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
      isUploaded: sessionMedia.getIsUploaded().toBoolean(),
      createdAt: sessionMedia.getCreatedAt().toDate(),
    };
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.sessionMediaDelete.execute(id);
    return { message: 'SessionMedia deleted successfully' };
  }
}