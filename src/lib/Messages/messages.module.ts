import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
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
import { MessagesHandleIncoming } from './application/MessagesHandleIncoming';
import { BaileysMessageSender } from './infrastructure/BaileysMessageSender';
import { MessageHandlerFactory } from './infrastructure/MessageHandlerFactory';
import { NodeFileService } from './infrastructure/NodeFileService';
import { NodeCryptoService } from './infrastructure/NodeCryptoService';
import { SessionsModule } from '../Sessions/sessions.module';
import { TextMessagesModule } from '../TextMessages/textMessages.module';
import { MediaMessagesModule } from '../MediaMessages/mediaMessages.module';
import { ReactionMessagesModule } from '../ReactionMessages/reactionMessages.module';
import { MessageStatusModule } from '../MessageStatus/messageStatus.module';
import { EventLogsModule } from '../EventLogs/eventLogs.module';
import { MessageStatusTrackSentMessage } from '../MessageStatus/application/MessageStatusTrackSentMessage';
import { MessageStatusCreateMessageReceipt } from '../MessageStatus/application/MessageStatusCreateMessageReceipt';
import { MessageStatusCreateValidated } from '../MessageStatus/application/MessageStatusCreateValidated';
import { OutgoingMessageQueue } from './infrastructure/OutgoingMessageQueue';
import { OutgoingMessageProcessor } from './infrastructure/OutgoingMessageProcessor';
import { IncomingMessageQueue } from './infrastructure/IncomingMessageQueue';
import { IncomingMessageProcessor } from './infrastructure/IncomingMessageProcessor';
import { MessageKeyBufferService } from './infrastructure/MessageKeyBufferService';

@Module({
  imports: [
    TypeOrmModule.forFeature([TypeOrmMessagesEntity]),
    BullModule.registerQueue(
      { name: 'outgoing-messages' },
      { name: 'incoming-messages' },
    ),
    BullBoardModule.forFeature({
      name: 'outgoing-messages',
      adapter: BullMQAdapter,
    }),
    BullBoardModule.forFeature({
      name: 'incoming-messages',
      adapter: BullMQAdapter,
    }),
    forwardRef(() => SessionsModule),
    TextMessagesModule,
    MediaMessagesModule,
    ReactionMessagesModule,
    MessageStatusModule,
    EventLogsModule,
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
        messageStatusTracker,
        messageStatusCreateReceipt,
        messageStatusCreateValidated,
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
          messageStatusTracker,
          messageStatusCreateReceipt,
          messageStatusCreateValidated,
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
        MessageStatusTrackSentMessage,
        MessageStatusCreateMessageReceipt,
        MessageStatusCreateValidated,
      ],
    },
    {
      provide: 'MessagesHandleIncoming',
      useFactory: (
        messagesCreate,
        textMessagesCreate,
        mediaMessagesCreate,
        mediaMessagesUpdate,
        reactionMessagesCreate,
        cryptoService,
        s3MediaUploader,
      ) =>
        new MessagesHandleIncoming(
          messagesCreate,
          textMessagesCreate,
          mediaMessagesCreate,
          mediaMessagesUpdate,
          reactionMessagesCreate,
          cryptoService,
          s3MediaUploader,
        ),
      inject: [
        'MessagesCreate',
        'TextMessagesCreate',
        'MediaMessagesCreate',
        'MediaMessagesUpdate',
        'ReactionMessagesCreate',
        'CryptoService',
        'S3MediaUploader',
      ],
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
    OutgoingMessageQueue,
    OutgoingMessageProcessor,
    IncomingMessageQueue,
    IncomingMessageProcessor,
    {
      provide: 'IncomingMessageQueue',
      useExisting: IncomingMessageQueue,
    },
    MessageKeyBufferService,
  ],
  exports: [
    'MessageRepository',
    'MessagesCreate',
    'MessagesGetByBaileysId',
    'MessageSender',
    'MessagesOrchestrator',
    'MessagesHandleIncoming',
    OutgoingMessageQueue,
    IncomingMessageQueue,
    'IncomingMessageQueue',
    MessageKeyBufferService, // Exportar el servicio para otros módulos
  ],
})
export class MessagesModule {}
