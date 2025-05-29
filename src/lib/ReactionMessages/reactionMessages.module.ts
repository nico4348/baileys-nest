import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReactionMessagesController } from './reactionMessages.controller';
import { TypeOrmReactionMessagesEntity } from './infrastructure/TypeOrm/TypeOrmReactionMessagesEntity';
import { TypeOrmReactionMessagesRepository } from './infrastructure/TypeOrm/TypeOrmReactionMessagesRepository';
import { ReactionMessagesCreate } from './application/ReactionMessagesCreate';
import { ReactionMessagesGetAll } from './application/ReactionMessagesGetAll';
import { ReactionMessagesGetOneById } from './application/ReactionMessagesGetOneById';
import { ReactionMessagesGetByMessageId } from './application/ReactionMessagesGetByMessageId';
import { ReactionMessagesGetByTargetMessageId } from './application/ReactionMessagesGetByTargetMessageId';
import { ReactionMessagesGetBySessionId } from './application/ReactionMessagesGetBySessionId';
import { ReactionMessagesGetByEmoji } from './application/ReactionMessagesGetByEmoji';
import { ReactionMessagesUpdate } from './application/ReactionMessagesUpdate';
import { ReactionMessagesDelete } from './application/ReactionMessagesDelete';
import { ReactionMessageHandler } from './infrastructure/ReactionMessageHandler';

@Module({
  imports: [TypeOrmModule.forFeature([TypeOrmReactionMessagesEntity])],
  controllers: [ReactionMessagesController],
  providers: [
    {
      provide: 'ReactionMessageRepository',
      useClass: TypeOrmReactionMessagesRepository,
    },
    {
      provide: 'ReactionMessagesCreate',
      useFactory: (repository: TypeOrmReactionMessagesRepository) =>
        new ReactionMessagesCreate(repository),
      inject: ['ReactionMessageRepository'],
    },
    {
      provide: 'ReactionMessagesGetAll',
      useFactory: (repository: TypeOrmReactionMessagesRepository) =>
        new ReactionMessagesGetAll(repository),
      inject: ['ReactionMessageRepository'],
    },
    {
      provide: 'ReactionMessagesGetOneById',
      useFactory: (repository: TypeOrmReactionMessagesRepository) =>
        new ReactionMessagesGetOneById(repository),
      inject: ['ReactionMessageRepository'],
    },
    {
      provide: 'ReactionMessagesGetByMessageId',
      useFactory: (repository: TypeOrmReactionMessagesRepository) =>
        new ReactionMessagesGetByMessageId(repository),
      inject: ['ReactionMessageRepository'],
    },
    {
      provide: 'ReactionMessagesGetByTargetMessageId',
      useFactory: (repository: TypeOrmReactionMessagesRepository) =>
        new ReactionMessagesGetByTargetMessageId(repository),
      inject: ['ReactionMessageRepository'],
    },
    {
      provide: 'ReactionMessagesGetBySessionId',
      useFactory: (repository: TypeOrmReactionMessagesRepository) =>
        new ReactionMessagesGetBySessionId(repository),
      inject: ['ReactionMessageRepository'],
    },
    {
      provide: 'ReactionMessagesGetByEmoji',
      useFactory: (repository: TypeOrmReactionMessagesRepository) =>
        new ReactionMessagesGetByEmoji(repository),
      inject: ['ReactionMessageRepository'],
    },
    {
      provide: 'ReactionMessagesUpdate',
      useFactory: (repository: TypeOrmReactionMessagesRepository) =>
        new ReactionMessagesUpdate(repository),
      inject: ['ReactionMessageRepository'],
    },
    {
      provide: 'ReactionMessagesDelete',
      useFactory: (repository: TypeOrmReactionMessagesRepository) =>
        new ReactionMessagesDelete(repository),
      inject: ['ReactionMessageRepository'],
    },
    {
      provide: 'ReactionMessageHandler',
      useFactory: (reactionMessagesCreate) => new ReactionMessageHandler(reactionMessagesCreate),
      inject: ['ReactionMessagesCreate'],
    },
  ],
  exports: ['ReactionMessageRepository', 'ReactionMessagesCreate', 'ReactionMessageHandler'],
})
export class ReactionMessagesModule {}
