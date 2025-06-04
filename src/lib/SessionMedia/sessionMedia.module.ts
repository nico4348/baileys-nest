import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { SessionMediaController } from './sessionMedia.controller';
import { TypeOrmSessionMediaEntity } from './infrastructure/TypeOrm/TypeOrmSessionMediaEntity';
import { TypeOrmSessionMediaRepository } from './infrastructure/TypeOrm/TypeOrmSessionMediaRepository';
import { SessionMediaCreate } from './application/SessionMediaCreate';
import { SessionMediaGetAll } from './application/SessionMediaGetAll';
import { SessionMediaGetOneById } from './application/SessionMediaGetOneById';
import { SessionMediaGetBySessionId } from './application/SessionMediaGetBySessionId';
import { SessionMediaUpdate } from './application/SessionMediaUpdate';
import { SessionMediaDelete } from './application/SessionMediaDelete';
import { S3UploadService } from './infrastructure/S3UploadService';
import { FileUploadQueue } from './infrastructure/FileUploadQueue';
import { FileUploadProcessor } from './infrastructure/FileUploadProcessor';
import { FileStorage } from './infrastructure/FileStorage';

@Module({
  imports: [
    TypeOrmModule.forFeature([TypeOrmSessionMediaEntity]),
    BullModule.registerQueue({
      name: 'file-upload',
    }),
    BullBoardModule.forFeature({
      name: 'file-upload',
      adapter: BullMQAdapter,
    }),
  ],
  controllers: [SessionMediaController],
  providers: [
    {
      provide: 'SessionMediaRepository',
      useClass: TypeOrmSessionMediaRepository,
    },
    SessionMediaCreate,
    SessionMediaGetAll,
    SessionMediaGetOneById,
    SessionMediaGetBySessionId,
    SessionMediaUpdate,
    SessionMediaDelete,
    S3UploadService,
    FileUploadQueue,
    FileUploadProcessor,
    FileStorage,
  ],
  exports: [
    'SessionMediaRepository',
    SessionMediaCreate,
    SessionMediaGetAll,
    SessionMediaGetOneById,
    SessionMediaGetBySessionId,
    SessionMediaUpdate,
    SessionMediaDelete,
    S3UploadService,
    FileUploadQueue,
    FileStorage,
  ],
})
export class SessionMediaModule {}
