import { Module } from '@nestjs/common';
import { SessionsController } from './sessions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmSessionsEntity } from './infrastructure/TypeOrm/TypeOrmSessionsEntity';
import { TypeOrmSessionsRepository } from './infrastructure/TypeOrm/TypeOrmSessionsRepository';
import { SessionsCreate } from './application/SessionsCreate';
import { SessionsGetAll } from './application/SessionsGetAll';
import { SessionsUpdate } from './application/SessionsUpdate';
import { SessionsGetOneById } from './application/SessionsGetOneById';
import { SessionsGetOneByPhone } from './application/SessionsGetOneByPhone';
import { SessionsGetByStatus } from './application/SessionsGetByStatus';
import { SessionsGetByPhone } from './application/SessionsGetByPhone';
import { SessionsGetByIsDeleted } from './application/SessionsGetByIsDeleted';
import { SessionsGetByDateRange } from './application/SessionsGetByDateRange';
import { SessionsOnInit } from './application/SessionsOnInit';
import { SessionsDelete } from './application/SessionsDelete';
import { SessionsHardDelete } from './application/SessionsHardDelete';
import { SessionsStart } from './application/SessionsStart';
import { SessionsResume } from './application/SessionsResume';
import { SessionsRestart } from './application/SessionsRestart';
import { SessionsStop } from './application/SessionsStop';
import { WhatsAppSessionManager } from './infrastructure/WhatsAppSessionManager';
import { SessionQrService } from './infrastructure/SessionQrService';
import { SessionOperationsService } from './infrastructure/SessionOperationsService';
import { SessionLifecycleManager } from './infrastructure/SessionLifecycleManager';
import { QrManager } from './infrastructure/QrManager';
import { ConnectionManager } from './infrastructure/ConnectionManager';
import { SessionLogger } from './infrastructure/SessionLogger';
import { SessionAutoInitializer } from './infrastructure/SessionAutoInitializer';
import { QrCounterManager } from './infrastructure/QrCounterManager';
import { AuthModule } from '../AuthState/authState.module';
import { AuthStateFactory } from '../AuthState/infrastructure/AuthStateFactory';
import { SessionLogsModule } from '../SessionLogs/sessionLogs.module';
import { EventsModule } from '../Events/events.module';
import { EventLogsModule } from '../EventLogs/eventLogs.module';
import { BaileysEventLogger } from '../EventLogs/infrastructure/BaileysEventLogger';
import { EventSeeder } from '../Events/infrastructure/EventSeeder';
@Module({
  imports: [
    TypeOrmModule.forFeature([TypeOrmSessionsEntity]),
    AuthModule,
    SessionLogsModule,
    EventsModule,
    EventLogsModule,
  ],
  controllers: [SessionsController],
  providers: [
    {
      provide: 'SessionsRepository',
      useClass: TypeOrmSessionsRepository,
    },
    {
      provide: 'SessionsOnInit',
      useFactory: (repository: TypeOrmSessionsRepository) =>
        new SessionsOnInit(repository),
      inject: ['SessionsRepository'],
    },
    {
      provide: 'SessionsCreate',
      useFactory: (repository: TypeOrmSessionsRepository) =>
        new SessionsCreate(repository),
      inject: ['SessionsRepository'],
    },
    {
      provide: 'SessionsUpdate',
      useFactory: (repository: TypeOrmSessionsRepository) =>
        new SessionsUpdate(repository),
      inject: ['SessionsRepository'],
    },
    {
      provide: 'SessionsGetOneById',
      useFactory: (repository: TypeOrmSessionsRepository) =>
        new SessionsGetOneById(repository),
      inject: ['SessionsRepository'],
    },
    {
      provide: 'SessionsGetAll',
      useFactory: (repository: TypeOrmSessionsRepository) =>
        new SessionsGetAll(repository),
      inject: ['SessionsRepository'],
    },
    {
      provide: 'SessionsGetOneByPhone',
      useFactory: (repository: TypeOrmSessionsRepository) =>
        new SessionsGetOneByPhone(repository),
      inject: ['SessionsRepository'],
    },
    {
      provide: 'SessionsGetByStatus',
      useFactory: (repository: TypeOrmSessionsRepository) =>
        new SessionsGetByStatus(repository),
      inject: ['SessionsRepository'],
    },
    {
      provide: 'SessionsGetByPhone',
      useFactory: (repository: TypeOrmSessionsRepository) =>
        new SessionsGetByPhone(repository),
      inject: ['SessionsRepository'],
    },
    {
      provide: 'SessionsGetByIsDeleted',
      useFactory: (repository: TypeOrmSessionsRepository) =>
        new SessionsGetByIsDeleted(repository),
      inject: ['SessionsRepository'],
    },
    {
      provide: 'SessionsGetByDateRange',
      useFactory: (repository: TypeOrmSessionsRepository) =>
        new SessionsGetByDateRange(repository),
      inject: ['SessionsRepository'],
    },
    {
      provide: 'SessionsDelete',
      useFactory: (
        repository: TypeOrmSessionsRepository,
        sessionsGetOneById: SessionsGetOneById,
      ) => new SessionsDelete(repository, sessionsGetOneById),
      inject: ['SessionsRepository', 'SessionsGetOneById'],
    },
    {
      provide: 'SessionsHardDelete',
      useFactory: (repository: TypeOrmSessionsRepository) =>
        new SessionsHardDelete(repository),
      inject: ['SessionsRepository'],
    },
    {
      provide: 'SessionsStart',
      useFactory: (
        repository: TypeOrmSessionsRepository,
        sessionsGetOneById: SessionsGetOneById,
        sessionsUpdate: SessionsUpdate,
      ) => new SessionsStart(repository, sessionsGetOneById, sessionsUpdate),
      inject: ['SessionsRepository', 'SessionsGetOneById', 'SessionsUpdate'],
    },
    {
      provide: 'SessionsResume',
      useFactory: (
        repository: TypeOrmSessionsRepository,
        sessionsGetOneById: SessionsGetOneById,
        sessionsUpdate: SessionsUpdate,
      ) => new SessionsResume(repository, sessionsGetOneById, sessionsUpdate),
      inject: ['SessionsRepository', 'SessionsGetOneById', 'SessionsUpdate'],
    },
    {
      provide: 'SessionsRestart',
      useFactory: (
        repository: TypeOrmSessionsRepository,
        sessionsGetOneById: SessionsGetOneById,
        sessionsUpdate: SessionsUpdate,
      ) => new SessionsRestart(repository, sessionsGetOneById, sessionsUpdate),
      inject: ['SessionsRepository', 'SessionsGetOneById', 'SessionsUpdate'],
    },
    {
      provide: 'SessionsStop',
      useFactory: (
        repository: TypeOrmSessionsRepository,
        sessionsGetOneById: SessionsGetOneById,
        sessionsUpdate: SessionsUpdate,
      ) => new SessionsStop(repository, sessionsGetOneById, sessionsUpdate),
      inject: ['SessionsRepository', 'SessionsGetOneById', 'SessionsUpdate'],
    }, // New specialized services
    SessionLogger,
    {
      provide: SessionQrService,
      useFactory: (logger: SessionLogger) => new SessionQrService(logger),
      inject: [SessionLogger],
    },
    {
      provide: SessionOperationsService,
      useFactory: (
        sessionsStart: SessionsStart,
        sessionsResume: SessionsResume,
        sessionsRestart: SessionsRestart,
        sessionsStop: SessionsStop,
        sessionsDelete: SessionsDelete,
        logger: SessionLogger,
        sessionLogLogger: any,
      ) =>
        new SessionOperationsService(
          sessionsStart,
          sessionsResume,
          sessionsRestart,
          sessionsStop,
          sessionsDelete,
          logger,
          sessionLogLogger,
        ),
      inject: [
        'SessionsStart',
        'SessionsResume',
        'SessionsRestart',
        'SessionsStop',
        'SessionsDelete',
        SessionLogger,
        'ISessionLogLogger',
      ],
    },
    {
      provide: SessionLifecycleManager,
      useFactory: (
        sessionsRepository: TypeOrmSessionsRepository,
        logger: SessionLogger,
      ) => new SessionLifecycleManager(sessionsRepository, logger),
      inject: ['SessionsRepository', SessionLogger],
    },
    {
      provide: QrManager,
      useFactory: (logger: SessionLogger) => new QrManager(logger),
      inject: [SessionLogger],
    },
    {
      provide: QrCounterManager,
      useFactory: (logger: SessionLogger) => new QrCounterManager(logger),
      inject: [SessionLogger],
    },
    {
      provide: ConnectionManager,
      useFactory: (
        qrManager: QrManager,
        qrCounterManager: QrCounterManager,
        logger: SessionLogger,
        sessionLogLogger: any,
      ) =>
        new ConnectionManager(
          qrManager,
          qrCounterManager,
          logger,
          sessionLogLogger,
        ),
      inject: [QrManager, QrCounterManager, SessionLogger, 'ISessionLogLogger'],
    },
    {
      provide: WhatsAppSessionManager,
      useFactory: (
        authStateFactory: AuthStateFactory,
        sessionsRepository: TypeOrmSessionsRepository,
        sessionsGetOneById: SessionsGetOneById,
        sessionQrService: SessionQrService,
        sessionOperations: SessionOperationsService,
        lifecycleManager: SessionLifecycleManager,
        qrManager: QrManager,
        connectionManager: ConnectionManager,
        qrCounterManager: QrCounterManager,
        logger: SessionLogger,
        eventLogger: BaileysEventLogger,
      ) =>
        new WhatsAppSessionManager(
          authStateFactory,
          sessionsRepository,
          sessionsGetOneById,
          sessionQrService,
          sessionOperations,
          lifecycleManager,
          qrManager,
          connectionManager,
          qrCounterManager,
          logger,
          eventLogger,
        ),
      inject: [
        'AuthStateFactory',
        'SessionsRepository',
        'SessionsGetOneById',
        SessionQrService,
        SessionOperationsService,
        SessionLifecycleManager,
        QrManager,
        ConnectionManager,
        QrCounterManager,
        SessionLogger,
        BaileysEventLogger,
      ],
    },
    // Baileys Event Logger
    {
      provide: BaileysEventLogger,
      useFactory: (eventLogsCreate: any, eventsGetOneByName: any) =>
        new BaileysEventLogger(eventLogsCreate, eventsGetOneByName),
      inject: ['EventLogsCreate', 'EventsGetOneByName'],
    },
    // Auto-initializer for starting sessions on bootstrap
    {
      provide: SessionAutoInitializer,
      useFactory: (
        sessionManager: WhatsAppSessionManager,
        sessionsRepository: TypeOrmSessionsRepository,
        logger: SessionLogger,
      ) =>
        new SessionAutoInitializer(sessionManager, sessionsRepository, logger),
      inject: [WhatsAppSessionManager, 'SessionsRepository', SessionLogger],
    },
  ],
  exports: [WhatsAppSessionManager],
})
export class SessionsModule {}
