import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Domain
import { SessionLogRepository } from './domain/SessionLogRepository';

// Application
import { SessionLogsCreate } from './application/SessionLogsCreate';
import { SessionLogsGetAll } from './application/SessionLogsGetAll';
import { SessionLogsGetOneById } from './application/SessionLogsGetOneById';
import { SessionLogsGetBySessionId } from './application/SessionLogsGetBySessionId';
import { SessionLogsGetBySessionIdAndType } from './application/SessionLogsGetBySessionIdAndType';
import { SessionLogsGetRecent } from './application/SessionLogsGetRecent';
import { SessionLogsUpdate } from './application/SessionLogsUpdate';
import { SessionLogsDelete } from './application/SessionLogsDelete';
import { SessionLogsDeleteBySessionId } from './application/SessionLogsDeleteBySessionId';
import { SessionLogsCleanup } from './application/SessionLogsCleanup';

// Infrastructure
import { TypeOrmSessionLogsEntity } from './infrastructure/TypeOrm/TypeOrmSessionLogsEntity';
import { TypeOrmSessionLogsRepository } from './infrastructure/TypeOrm/TypeOrmSessionLogsRepository';
import { WhatsAppLogger } from './infrastructure/WhatsAppLogger';
import { ISessionLogLogger } from './infrastructure/interfaces/ISessionLogLogger';

// Controller
import { SessionLogsController } from './sessionLogs.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TypeOrmSessionLogsEntity])],
  controllers: [SessionLogsController],
  providers: [
    // Repository
    {
      provide: 'SessionLogRepository',
      useClass: TypeOrmSessionLogsRepository,
    },

    // Application Services
    SessionLogsCreate,
    SessionLogsGetAll,
    SessionLogsGetOneById,
    SessionLogsGetBySessionId,
    SessionLogsGetBySessionIdAndType,
    SessionLogsGetRecent,
    SessionLogsUpdate,
    SessionLogsDelete,
    SessionLogsDeleteBySessionId,
    SessionLogsCleanup,

    // Infrastructure Services
    WhatsAppLogger,
    {
      provide: 'ISessionLogLogger',
      useClass: WhatsAppLogger,
    },
  ],
  exports: [
    'SessionLogRepository',
    SessionLogsCreate,
    SessionLogsGetAll,
    SessionLogsGetOneById,
    SessionLogsGetBySessionId,
    SessionLogsGetBySessionIdAndType,
    SessionLogsGetRecent,
    SessionLogsUpdate,
    SessionLogsDelete,
    SessionLogsDeleteBySessionId,
    SessionLogsCleanup,
    WhatsAppLogger,
    'ISessionLogLogger',
  ],
})
export class SessionLogsModule {}
