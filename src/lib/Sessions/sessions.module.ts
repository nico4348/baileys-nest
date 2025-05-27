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
import { SessionsOnInit } from './application/SessionsOnInit';
import { SessionsDelete } from './application/SessionsDelete';
import { SessionsHardDelete } from './application/SessionsHardDelete';
import { SessionsStart } from './application/SessionsStart';
import { SessionsResume } from './application/SessionsResume';
import { SessionsRestart } from './application/SessionsRestart';
import { SessionsStop } from './application/SessionsStop';
import { WhatsAppSessionManager } from './infrastructure/WhatsAppSessionManager';
import { SessionQrService } from './infrastructure/SessionQrService';
import { AuthModule } from '../AuthState/authState.module';
import { AuthStateFactory } from '../AuthState/infrastructure/AuthStateFactory';
@Module({
  imports: [TypeOrmModule.forFeature([TypeOrmSessionsEntity]), AuthModule],
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
    },
    SessionQrService,
    {
      provide: WhatsAppSessionManager,
      useFactory: (
        authStateFactory: AuthStateFactory,
        sessionsRepository: TypeOrmSessionsRepository,
        sessionsUpdate: SessionsUpdate,
        sessionsGetOneById: SessionsGetOneById,
        sessionsDelete: SessionsDelete,
        sessionQrService: SessionQrService,
        sessionsStart: SessionsStart,
        sessionsResume: SessionsResume,
        sessionsRestart: SessionsRestart,
        sessionsStop: SessionsStop,
      ) =>
        new WhatsAppSessionManager(
          authStateFactory,
          sessionsRepository,
          sessionsUpdate,
          sessionsGetOneById,
          sessionsDelete,
          sessionQrService,
          sessionsStart,
          sessionsResume,
          sessionsRestart,
          sessionsStop,
        ),
      inject: [
        'AuthStateFactory',
        'SessionsRepository',
        'SessionsUpdate',
        'SessionsGetOneById',
        'SessionsDelete',
        SessionQrService,
        'SessionsStart',
        'SessionsResume',
        'SessionsRestart',
        'SessionsStop',
      ],
    },
  ],
})
export class SessionsModule {}
