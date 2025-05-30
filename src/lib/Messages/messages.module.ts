import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessagesController } from './messages.controller';
import { TypeOrmMessagesEntity } from './infrastructure/TypeOrm/TypeOrmMessagesEntity';
import { TypeOrmMessagesRepository } from './infrastructure/TypeOrm/TypeOrmMessagesRepository';
import { MessagesCreate } from './application/MessagesCreate';
import { MessagesGetAll } from './application/MessagesGetAll';
import { MessagesGetOneById } from './application/MessagesGetOneById';
import { MessagesGetBySessionId } from './application/MessagesGetBySessionId';
import { MessagesGetByBaileysId } from './application/MessagesGetByBaileysId';
import { MessagesUpdate } from './application/MessagesUpdate';
import { MessagesDelete } from './application/MessagesDelete';
import { MessagesOrchestrator } from './application/MessagesOrchestrator';
import { SendMessage } from './application/SendMessage';
import { BaileysMessageSender } from './infrastructure/BaileysMessageSender';
import { MessageHandlerFactory } from './infrastructure/MessageHandlerFactory';
import { NodeFileService } from './infrastructure/NodeFileService';
import { NodeCryptoService } from './infrastructure/NodeCryptoService';
import { SessionsModule } from '../Sessions/sessions.module';
import { TextMessagesModule } from '../TextMessages/textMessages.module';
import { MediaMessagesModule } from '../MediaMessages/mediaMessages.module';
import { ReactionMessagesModule } from '../ReactionMessages/reactionMessages.module';
import { MessageStatusModule } from '../MessageStatus/messageStatus.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TypeOrmMessagesEntity]),
    SessionsModule,
    TextMessagesModule,
    MediaMessagesModule,
    ReactionMessagesModule,
    MessageStatusModule,
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
      provide: 'MessagesGetByBaileysId',
      useFactory: (repository: TypeOrmMessagesRepository) =>
        new MessagesGetByBaileysId(repository),
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
      provide: 'MessageSender',
      useClass: BaileysMessageSender,
    },
    {
      provide: 'FileService',
      useClass: NodeFileService,
    },
    {
      provide: 'CryptoService',
      useClass: NodeCryptoService,
    },
    {
      provide: 'MessagesOrchestrator',
      useFactory: (
        messagesCreate,
        messagesGetOneById,
        textMessagesCreate,
        mediaMessagesCreate,
        reactionMessagesCreate,
        messageSender,
        fileService,
        cryptoService,
      ) =>
        new MessagesOrchestrator(
          messagesCreate,
          messagesGetOneById,
          textMessagesCreate,
          mediaMessagesCreate,
          reactionMessagesCreate,
          messageSender,
          fileService,
          cryptoService,
        ),
      inject: [
        'MessagesCreate',
        'MessagesGetOneById',
        'TextMessagesCreate',
        'MediaMessagesCreate',
        'ReactionMessagesCreate',
        'MessageSender',
        'FileService',
        'CryptoService',
      ],
    },
    {
      provide: 'SendMessage',
      useFactory: (messagesOrchestrator) =>
        new SendMessage(messagesOrchestrator),
      inject: ['MessagesOrchestrator'],
    },
    {
      provide: 'MessageHandlerFactory',
      useFactory: (textHandler, mediaHandler, reactionHandler) =>
        new MessageHandlerFactory(textHandler, mediaHandler, reactionHandler),
      inject: [
        'TextMessageHandler',
        'MediaMessageHandler',
        'ReactionMessageHandler',
      ],
    },
  ],
  exports: [
    'MessageRepository',
    'MessagesCreate',
    'MessagesGetByBaileysId',
    'MessageSender',
    'MessagesOrchestrator',
    'SendMessage',
  ],
})
export class MessagesModule {}
