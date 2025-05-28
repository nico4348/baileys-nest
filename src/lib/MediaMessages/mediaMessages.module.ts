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
import { MediaMessagesSendMedia } from './application/MediaMessagesSendMedia';
import { DownloadMediaMessage } from './application/DownloadMediaMessage';
import { MessagesModule } from '../Messages/messages.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TypeOrmMediaMessagesEntity]),
    MessagesModule,
  ],
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
      provide: 'MediaMessagesSendMedia',
      useFactory: (
        mediaMessagesCreate: MediaMessagesCreate,
        messageSender: any,
      ) => new MediaMessagesSendMedia(mediaMessagesCreate, messageSender),
      inject: ['MediaMessagesCreate', 'BaileysMessageSender'],
    },
    {
      provide: 'DownloadMediaMessage',
      useFactory: (
        mediaMessagesGetOneById: MediaMessagesGetOneById,
      ) => new DownloadMediaMessage(mediaMessagesGetOneById),
      inject: ['MediaMessagesGetOneById'],
    },
  ],
  exports: ['MediaMessageRepository', 'MediaMessagesCreate'],
})
export class MediaMessagesModule {}