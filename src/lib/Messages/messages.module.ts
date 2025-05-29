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
import { WhatsAppSessionManager } from '../Sessions/infrastructure/WhatsAppSessionManager';
import { SessionsModule } from '../Sessions/sessions.module';
import { TextMessagesModule } from '../TextMessages/textMessages.module';
import { MediaMessagesModule } from '../MediaMessages/mediaMessages.module';
import { ReactionMessagesModule } from '../ReactionMessages/reactionMessages.module';

// Import Send services
import { TextMessagesSendText } from '../TextMessages/application/TextMessagesSendText';
import { MediaMessagesSendMedia } from '../MediaMessages/application/MediaMessagesSendMedia';
import { ReactionMessagesSendReaction } from '../ReactionMessages/application/ReactionMessagesSendReaction';

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
      inject: [WhatsAppSessionManager],
    },
    // Send Services
    {
      provide: 'TextMessagesSendText',
      useFactory: (
        textMessagesCreate: any,
        messageSender: BaileysMessageSender,
      ) => new TextMessagesSendText(textMessagesCreate, messageSender),
      inject: ['TextMessagesCreate', BaileysMessageSender],
    },
    {
      provide: 'MediaMessagesSendMedia',
      useFactory: (
        mediaMessagesCreate: any,
        messageSender: BaileysMessageSender,
      ) => new MediaMessagesSendMedia(mediaMessagesCreate, messageSender),
      inject: ['MediaMessagesCreate', BaileysMessageSender],
    },
    {
      provide: 'ReactionMessagesSendReaction',
      useFactory: (
        reactionMessagesCreate: any,
        messageSender: BaileysMessageSender,
      ) =>
        new ReactionMessagesSendReaction(reactionMessagesCreate, messageSender),
      inject: ['ReactionMessagesCreate', BaileysMessageSender],
    },
    {
      provide: 'MessagesOrchestrator',
      useFactory: (
        messagesCreate: MessagesCreate,
        textMessagesSendText: any,
        mediaMessagesSendMedia: any,
        reactionMessagesSendReaction: any,
        textMessagesCreate: any,
        mediaMessagesCreate: any,
        reactionMessagesCreate: any,
        messageSender: BaileysMessageSender,
      ) =>
        new MessagesOrchestrator(
          messagesCreate,
          textMessagesSendText,
          mediaMessagesSendMedia,
          reactionMessagesSendReaction,
          textMessagesCreate,
          mediaMessagesCreate,
          reactionMessagesCreate,
          messageSender,
        ),
      inject: [
        'MessagesCreate',
        'TextMessagesSendText',
        'MediaMessagesSendMedia',
        'ReactionMessagesSendReaction',
        'TextMessagesCreate',
        'MediaMessagesCreate',
        'ReactionMessagesCreate',
        BaileysMessageSender,
      ],
    },
  ],
  exports: [
    'MessageRepository',
    'MessagesCreate',
    BaileysMessageSender,
    'MessagesOrchestrator',
  ],
})
export class MessagesModule {}
