import { Module } from '@nestjs/common';
import { SessionsController } from './sessions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmSessionsEntity } from './infrastructure/TypeOrm/TypeOrmSessionsEntity';
import { TypeOrmSessionsRepository } from './infrastructure/TypeOrm/TypeOrmSessionsRepository';
import { SessionsCreate } from './application/SessionsCreate';
import { SessionsOnInit } from './application/SessionsOnInit';
@Module({
  imports: [TypeOrmModule.forFeature([TypeOrmSessionsEntity])],
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
  ],
})
export class SessionsModule {}
