import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessagesController } from './messages.controller';
import { TypeOrmMessagesEntity } from './infrastructure/TypeOrm/TypeOrmMessagesEntity';
import { TypeOrmMessagesRepository } from './infrastructure/TypeOrm/TypeOrmMessagesRepository';
import { MessagesCreate } from './application/MessagesCreate';
import { MessagesGetAll } from './application/MessagesGetAll';
import { MessagesGetOneById } from './application/MessagesGetOneById';
import { MessagesGetBySessionId } from './application/MessagesGetBySessionId';
import { MessagesUpdate } from './application/MessagesUpdate';
import { MessagesDelete } from './application/MessagesDelete';
import { MessagesOrchestrator } from './application/MessagesOrchestrator';
import { BaileysMessageSender } from './infrastructure/BaileysMessageSender';
import { SessionsModule } from '../Sessions/sessions.module';
import { TextMessagesModule } from '../TextMessages/textMessages.module';
import { MediaMessagesModule } from '../MediaMessages/mediaMessages.module';
import { ReactionMessagesModule } from '../ReactionMessages/reactionMessages.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TypeOrmMessagesEntity]),
    SessionsModule,
    TextMessagesModule,
    MediaMessagesModule,
    ReactionMessagesModule,
  ],
  controllers: [MessagesController],
  providers: [
    {
      provide: 'MessageRepository',
      useClass: TypeOrmMessagesRepository,
    },
    {
      provide: 'MessagesCreate',
      useFactory: (repository: TypeOrmMessagesRepository) =>
        new MessagesCreate(repository),
      inject: ['MessageRepository'],
    },
    {
      provide: 'MessagesGetAll',
      useFactory: (repository: TypeOrmMessagesRepository) =>
        new MessagesGetAll(repository),
      inject: ['MessageRepository'],
    },
    {
      provide: 'MessagesGetOneById',
      useFactory: (repository: TypeOrmMessagesRepository) =>
        new MessagesGetOneById(repository),
      inject: ['MessageRepository'],
    },
    {
      provide: 'MessagesGetBySessionId',
      useFactory: (repository: TypeOrmMessagesRepository) =>
        new MessagesGetBySessionId(repository),
      inject: ['MessageRepository'],
    },
    {
      provide: 'MessagesUpdate',
      useFactory: (repository: TypeOrmMessagesRepository) =>
        new MessagesUpdate(repository),
      inject: ['MessageRepository'],
    },
    {
      provide: 'MessagesDelete',
      useFactory: (repository: TypeOrmMessagesRepository) =>
        new MessagesDelete(repository),
      inject: ['MessageRepository'],
    },
    {
      provide: BaileysMessageSender,
      useFactory: (sessionManager: any) =>
        new BaileysMessageSender(sessionManager),
      inject: ['WhatsAppSessionManager'],
    },
    {
      provide: 'MessagesOrchestrator',
      useFactory: (
        messagesCreate: MessagesCreate,
        textMessagesCreate: any,
        mediaMessagesCreate: any,
        reactionMessagesCreate: any,
        textMessagesSendText: any,
        mediaMessagesSendMedia: any,
        reactionMessagesSendReaction: any,
      ) => new MessagesOrchestrator(
        messagesCreate,
        textMessagesCreate,
        mediaMessagesCreate,
        reactionMessagesCreate,
        textMessagesSendText,
        mediaMessagesSendMedia,
        reactionMessagesSendReaction,
      ),
      inject: [
        'MessagesCreate',
        'TextMessagesCreate',
        'MediaMessagesCreate',
        'ReactionMessagesCreate',
        'TextMessagesSendText',
        'MediaMessagesSendMedia',
        'ReactionMessagesSendReaction',
      ],
    },
  ],
  exports: ['MessageRepository', 'MessagesCreate', BaileysMessageSender],
})
export class MessagesModule {}