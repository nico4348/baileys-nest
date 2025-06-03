import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SessionMediaController } from './sessionMedia.controller';
import { TypeOrmSessionMediaEntity } from './infrastructure/TypeOrm/TypeOrmSessionMediaEntity';
import { TypeOrmSessionMediaRepository } from './infrastructure/TypeOrm/TypeOrmSessionMediaRepository';
import { SessionMediaRepository } from './domain/SessionMediaRepository';
import { SessionMediaCreate } from './application/SessionMediaCreate';
import { SessionMediaGetAll } from './application/SessionMediaGetAll';
import { SessionMediaGetOneById } from './application/SessionMediaGetOneById';
import { SessionMediaGetBySessionId } from './application/SessionMediaGetBySessionId';
import { SessionMediaUpdate } from './application/SessionMediaUpdate';
import { SessionMediaDelete } from './application/SessionMediaDelete';
import { S3PresignedUrlService } from './infrastructure/S3PresignedUrlService';

@Module({
  imports: [TypeOrmModule.forFeature([TypeOrmSessionMediaEntity])],
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
    S3PresignedUrlService,
  ],
  exports: [
    'SessionMediaRepository',
    SessionMediaCreate,
    SessionMediaGetAll,
    SessionMediaGetOneById,
    SessionMediaGetBySessionId,
    SessionMediaUpdate,
    SessionMediaDelete,
    S3PresignedUrlService,
  ],
})
export class SessionMediaModule {}