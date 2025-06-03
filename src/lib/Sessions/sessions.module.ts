import { Module, forwardRef } from '@nestjs/common';
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
import { SessionOrchestrationService } from './application/SessionOrchestrationService';
import { SessionQrService } from './infrastructure/SessionQrService';
import { SessionDependencyInitializer } from './infrastructure/SessionDependencyInitializer';
import { SessionOperationsService } from './infrastructure/SessionOperationsService';
import { SessionLifecycleManager } from './infrastructure/SessionLifecycleManager';
import { QrManager } from './infrastructure/QrManager';
import { ConnectionManager } from './infrastructure/ConnectionManager';
import { SessionLogger } from './infrastructure/SessionLogger';
import { SessionAutoInitializer } from './infrastructure/SessionAutoInitializer';
import { AuthModule } from '../AuthState/authState.module';
import { AuthStateFactory } from '../AuthState/infrastructure/AuthStateFactory';
import { SessionLogsModule } from '../SessionLogs/sessionLogs.module';
import { EventsModule } from '../Events/events.module';
import { EventLogsModule } from '../EventLogs/eventLogs.module';
import { MessageStatusModule } from '../MessageStatus/messageStatus.module';
import { MessagesModule } from '../Messages/messages.module';
import { BaileysEventLogger } from '../EventLogs/infrastructure/BaileysEventLogger';
import { MessageStatusTracker } from '../MessageStatus/infrastructure/MessageStatusTracker';
import { EventSeeder } from '../Events/infrastructure/EventSeeder';
@Module({
  imports: [
    TypeOrmModule.forFeature([TypeOrmSessionsEntity]),
    AuthModule,
    SessionLogsModule,
    EventsModule,
    EventLogsModule,
    MessageStatusModule,
    forwardRef(() => MessagesModule),
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
      provide: ConnectionManager,
      useFactory: (
        qrManager: QrManager,
        logger: SessionLogger,
        sessionLogLogger: any,
      ) => new ConnectionManager(qrManager, logger, sessionLogLogger),
      inject: [QrManager, SessionLogger, 'ISessionLogLogger'],
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
        logger: SessionLogger,
        eventLogger: BaileysEventLogger,
        messageStatusTracker: MessageStatusTracker,
        messagesHandleIncoming: any,
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
          logger,
          eventLogger,
          messageStatusTracker,
          messagesHandleIncoming,
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
        SessionLogger,
        BaileysEventLogger,
        MessageStatusTracker,
        'MessagesHandleIncoming',
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
    }, // Hexagonal Architecture Ports Configuration
    {
      provide: 'SessionStatePort',
      useExisting: WhatsAppSessionManager,
    },
    {
      provide: 'ConnectionPort',
      useExisting: ConnectionManager,
    },
    {
      provide: 'QrCounterPort',
      useExisting: QrManager,
    },
    // Application Services
    // Session Orchestration Service
    {
      provide: SessionOrchestrationService,
      useFactory: (sessionState, connection) =>
        new SessionOrchestrationService(sessionState, connection),
      inject: ['SessionStatePort', 'ConnectionPort'],
    },
    // Dependency initializer to resolve circular dependency
    {
      provide: SessionDependencyInitializer,
      useFactory: (connection, sessionState) =>
        new SessionDependencyInitializer(connection, sessionState),
      inject: ['ConnectionPort', 'SessionStatePort'],
    },
  ],
  exports: [
    WhatsAppSessionManager,
    SessionOrchestrationService,
  ],
})
export class SessionsModule {}
