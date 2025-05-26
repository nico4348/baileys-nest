import { Module } from '@nestjs/common';
import { SessionsController } from './sessions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmSessionsEntity } from './infrastructure/TypeOrm/TypeOrmSessionsEntity';
import { TypeOrmSessionsRepository } from './infrastructure/TypeOrm/TypeOrmSessionsRepository';
import { SessionsCreate } from './application/SessionsCreate';
import { SessionsUpdate } from './application/SessionsUpdate';
import { SessionsGetOneById } from './application/SessionsGetOneById';
import { SessionsOnInit } from './application/SessionsOnInit';
import { SessionSoftDelete } from './application/SessionSoftDelete';
import { WhatsAppSessionManager } from './infrastructure/WhatsAppSessionManager';
import { AuthModule } from '../AuthState/authState.module';
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
      provide: 'SessionSoftDelete',
      useFactory: (repository: TypeOrmSessionsRepository) =>
        new SessionSoftDelete(repository),
      inject: ['SessionsRepository'],
    },
    WhatsAppSessionManager,
  ],
})
export class SessionsModule {}
