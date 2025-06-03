import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MediaMessagesController } from './mediaMessages.controller';
import { TypeOrmMediaMessagesEntity } from './infrastructure/TypeOrm/TypeOrmMediaMessagesEntity';
import { TypeOrmMediaMessagesRepository } from './infrastructure/TypeOrm/TypeOrmMediaMessagesRepository';
import { MediaMessagesCreate } from './application/MediaMessagesCreate';
import { MediaMessagesGetAll } from './application/MediaMessagesGetAll';
import { MediaMessagesGetOneById } from './application/MediaMessagesGetOneById';
import { MediaMessagesGetByMessageId } from './application/MediaMessagesGetByMessageId';
import { MediaMessagesGetBySessionId } from './application/MediaMessagesGetBySessionId';
import { MediaMessagesGetByMediaType } from './application/MediaMessagesGetByMediaType';
import { MediaMessagesUpdate } from './application/MediaMessagesUpdate';
import { MediaMessagesDelete } from './application/MediaMessagesDelete';
import { DownloadMediaMessage } from './application/DownloadMediaMessage';
import { UploadMediaToS3 } from './application/UploadMediaToS3';
import { MediaMessageHandler } from './infrastructure/MediaMessageHandler';
import { S3MediaUploader } from './infrastructure/S3MediaUploader';

@Module({
  imports: [TypeOrmModule.forFeature([TypeOrmMediaMessagesEntity])],
  controllers: [MediaMessagesController],
  providers: [
    {
      provide: 'MediaMessageRepository',
      useClass: TypeOrmMediaMessagesRepository,
    },
    {
      provide: 'MediaMessagesCreate',
      useFactory: (repository: TypeOrmMediaMessagesRepository) =>
        new MediaMessagesCreate(repository),
      inject: ['MediaMessageRepository'],
    },
    {
      provide: 'MediaMessagesGetAll',
      useFactory: (repository: TypeOrmMediaMessagesRepository) =>
        new MediaMessagesGetAll(repository),
      inject: ['MediaMessageRepository'],
    },
    {
      provide: 'MediaMessagesGetOneById',
      useFactory: (repository: TypeOrmMediaMessagesRepository) =>
        new MediaMessagesGetOneById(repository),
      inject: ['MediaMessageRepository'],
    },
    {
      provide: 'MediaMessagesGetByMessageId',
      useFactory: (repository: TypeOrmMediaMessagesRepository) =>
        new MediaMessagesGetByMessageId(repository),
      inject: ['MediaMessageRepository'],
    },
    {
      provide: 'MediaMessagesGetBySessionId',
      useFactory: (repository: TypeOrmMediaMessagesRepository) =>
        new MediaMessagesGetBySessionId(repository),
      inject: ['MediaMessageRepository'],
    },
    {
      provide: 'MediaMessagesGetByMediaType',
      useFactory: (repository: TypeOrmMediaMessagesRepository) =>
        new MediaMessagesGetByMediaType(repository),
      inject: ['MediaMessageRepository'],
    },
    {
      provide: 'MediaMessagesUpdate',
      useFactory: (repository: TypeOrmMediaMessagesRepository) =>
        new MediaMessagesUpdate(repository),
      inject: ['MediaMessageRepository'],
    },
    {
      provide: 'MediaMessagesDelete',
      useFactory: (repository: TypeOrmMediaMessagesRepository) =>
        new MediaMessagesDelete(repository),
      inject: ['MediaMessageRepository'],
    },
    {
      provide: 'S3MediaUploader',
      useClass: S3MediaUploader,
    },
    {
      provide: 'UploadMediaToS3',
      useFactory: (
        mediaMessagesGetOneById: MediaMessagesGetOneById,
        mediaMessagesUpdate: MediaMessagesUpdate,
        s3MediaUploader: S3MediaUploader,
      ) => new UploadMediaToS3(mediaMessagesGetOneById, mediaMessagesUpdate, s3MediaUploader),
      inject: ['MediaMessagesGetOneById', 'MediaMessagesUpdate', 'S3MediaUploader'],
    },
    {
      provide: 'DownloadMediaMessage',
      useFactory: (
        mediaMessagesGetOneById: MediaMessagesGetOneById,
        uploadMediaToS3: UploadMediaToS3,
      ) => new DownloadMediaMessage(mediaMessagesGetOneById, uploadMediaToS3),
      inject: ['MediaMessagesGetOneById', 'UploadMediaToS3'],
    },
    {
      provide: 'MediaMessageHandler',
      useFactory: (mediaMessagesCreate) => new MediaMessageHandler(mediaMessagesCreate),
      inject: ['MediaMessagesCreate'],
    },
  ],
  exports: ['MediaMessageRepository', 'MediaMessagesCreate', 'MediaMessagesUpdate', 'MediaMessageHandler', 'S3MediaUploader'],
})
export class MediaMessagesModule {}
