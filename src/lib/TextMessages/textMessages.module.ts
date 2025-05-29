import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TextMessagesController } from './textMessages.controller';
import { TypeOrmTextMessagesEntity } from './infrastructure/TypeOrm/TypeOrmTextMessagesEntity';
import { TypeOrmTextMessagesRepository } from './infrastructure/TypeOrm/TypeOrmTextMessagesRepository';
import { TextMessagesCreate } from './application/TextMessagesCreate';
import { TextMessagesGetAll } from './application/TextMessagesGetAll';
import { TextMessagesGetOneById } from './application/TextMessagesGetOneById';
import { TextMessagesGetByMessageId } from './application/TextMessagesGetByMessageId';
import { TextMessagesGetBySessionId } from './application/TextMessagesGetBySessionId';
import { TextMessagesUpdate } from './application/TextMessagesUpdate';
import { TextMessagesDelete } from './application/TextMessagesDelete';

@Module({
  imports: [TypeOrmModule.forFeature([TypeOrmTextMessagesEntity])],
  controllers: [TextMessagesController],
  providers: [
    {
      provide: 'TextMessageRepository',
      useClass: TypeOrmTextMessagesRepository,
    },
    {
      provide: 'TextMessagesCreate',
      useFactory: (repository: TypeOrmTextMessagesRepository) =>
        new TextMessagesCreate(repository),
      inject: ['TextMessageRepository'],
    },
    {
      provide: 'TextMessagesGetAll',
      useFactory: (repository: TypeOrmTextMessagesRepository) =>
        new TextMessagesGetAll(repository),
      inject: ['TextMessageRepository'],
    },
    {
      provide: 'TextMessagesGetOneById',
      useFactory: (repository: TypeOrmTextMessagesRepository) =>
        new TextMessagesGetOneById(repository),
      inject: ['TextMessageRepository'],
    },
    {
      provide: 'TextMessagesGetByMessageId',
      useFactory: (repository: TypeOrmTextMessagesRepository) =>
        new TextMessagesGetByMessageId(repository),
      inject: ['TextMessageRepository'],
    },
    {
      provide: 'TextMessagesGetBySessionId',
      useFactory: (repository: TypeOrmTextMessagesRepository) =>
        new TextMessagesGetBySessionId(repository),
      inject: ['TextMessageRepository'],
    },
    {
      provide: 'TextMessagesUpdate',
      useFactory: (repository: TypeOrmTextMessagesRepository) =>
        new TextMessagesUpdate(repository),
      inject: ['TextMessageRepository'],
    },
    {
      provide: 'TextMessagesDelete',
      useFactory: (repository: TypeOrmTextMessagesRepository) =>
        new TextMessagesDelete(repository),
      inject: ['TextMessageRepository'],
    },
  ],
  exports: ['TextMessageRepository', 'TextMessagesCreate'],
})
export class TextMessagesModule {}
