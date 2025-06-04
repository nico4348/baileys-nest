import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { TypeOrmMessageStatusEntity } from './infrastructure/TypeOrm/TypeOrmMessageStatusEntity';
import { TypeOrmMessageStatusRepository } from './infrastructure/TypeOrm/TypeOrmMessageStatusRepository';
import { MessageStatusCreate } from './application/MessageStatusCreate';
import { MessageStatusGetAll } from './application/MessageStatusGetAll';
import { MessageStatusGetOneById } from './application/MessageStatusGetOneById';
import { MessageStatusGetByMessageId } from './application/MessageStatusGetByMessageId';
import { MessageStatusGetLatestByMessageId } from './application/MessageStatusGetLatestByMessageId';
import { MessageStatusTrackSentMessage } from './application/MessageStatusTrackSentMessage';
import { MessageStatusCreateMessageReceipt } from './application/MessageStatusCreateMessageReceipt';
import { MessageStatusCreateValidated } from './application/MessageStatusCreateValidated';
import { MessageStatusDelete } from './application/MessageStatusDelete';
import { BaileysStatusMapper } from './infrastructure/BaileysStatusMapper';
import { MessageStatusTracker } from './infrastructure/MessageStatusTracker';
import { MessageStatusController } from './messageStatus.controller';
import { StatusModule } from '../Status/status.module';
import { MessagesGetByBaileysId } from '../Messages/application/MessagesGetByBaileysId';
import { TypeOrmMessagesEntity } from '../Messages/infrastructure/TypeOrm/TypeOrmMessagesEntity';
import { TypeOrmMessagesRepository } from '../Messages/infrastructure/TypeOrm/TypeOrmMessagesRepository';
import { MessageStatusQueue } from './infrastructure/MessageStatusQueue';
import { MessageStatusProcessor } from './infrastructure/MessageStatusProcessor';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TypeOrmMessageStatusEntity,
      TypeOrmMessagesEntity,
    ]),
    BullModule.registerQueue({
      name: 'message-status-updates',
    }),
    BullBoardModule.forFeature({
      name: 'message-status-updates',
      adapter: BullMQAdapter,
    }),
    StatusModule,
  ],
  controllers: [MessageStatusController],
  providers: [
    {
      provide: 'MessageStatusRepository',
      useClass: TypeOrmMessageStatusRepository,
    },
    MessageStatusCreate,
    MessageStatusGetAll,
    MessageStatusGetOneById,
    MessageStatusGetByMessageId,
    MessageStatusGetLatestByMessageId,
    MessageStatusTrackSentMessage,
    MessageStatusCreateMessageReceipt,
    MessageStatusCreateValidated,
    MessageStatusDelete,
    BaileysStatusMapper,
    {
      provide: 'MessageRepository',
      useClass: TypeOrmMessagesRepository,
    },
    {
      provide: 'MessagesGetByBaileysId',
      useFactory: (repository: TypeOrmMessagesRepository) =>
        new MessagesGetByBaileysId(repository),
      inject: ['MessageRepository'],
    },
    MessageStatusTracker,
    MessageStatusQueue,
    MessageStatusProcessor,
  ],
  exports: [
    'MessageStatusRepository',
    MessageStatusCreate,
    MessageStatusGetAll,
    MessageStatusGetOneById,
    MessageStatusGetByMessageId,
    MessageStatusGetLatestByMessageId,
    MessageStatusTrackSentMessage,
    MessageStatusCreateMessageReceipt,
    MessageStatusCreateValidated,
    MessageStatusDelete,
    BaileysStatusMapper,
    MessageStatusTracker,
    MessageStatusQueue,
  ],
})
export class MessageStatusModule {}
