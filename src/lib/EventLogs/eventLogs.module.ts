import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventLogsController } from './eventLogs.controller';
import { TypeOrmEventLogsEntity } from './infrastructure/TypeOrm/TypeOrmEventLogsEntity';
import { TypeOrmEventLogsRepository } from './infrastructure/TypeOrm/TypeOrmEventLogsRepository';
import { EventLogsCreate } from './application/EventLogsCreate';
import { EventLogsGetAll } from './application/EventLogsGetAll';
import { EventLogsGetOneById } from './application/EventLogsGetOneById';
import { EventLogsGetBySessionId } from './application/EventLogsGetBySessionId';
import { EventLogsGetByEventId } from './application/EventLogsGetByEventId';
import { EventLogsUpdate } from './application/EventLogsUpdate';
import { EventLogsDelete } from './application/EventLogsDelete';

@Module({
  imports: [TypeOrmModule.forFeature([TypeOrmEventLogsEntity])],
  controllers: [EventLogsController],
  providers: [
    {
      provide: 'EventLogRepository',
      useClass: TypeOrmEventLogsRepository,
    },
    {
      provide: 'EventLogsCreate',
      useFactory: (repository: TypeOrmEventLogsRepository) =>
        new EventLogsCreate(repository),
      inject: ['EventLogRepository'],
    },
    {
      provide: 'EventLogsGetAll',
      useFactory: (repository: TypeOrmEventLogsRepository) =>
        new EventLogsGetAll(repository),
      inject: ['EventLogRepository'],
    },
    {
      provide: 'EventLogsGetOneById',
      useFactory: (repository: TypeOrmEventLogsRepository) =>
        new EventLogsGetOneById(repository),
      inject: ['EventLogRepository'],
    },
    {
      provide: 'EventLogsGetBySessionId',
      useFactory: (repository: TypeOrmEventLogsRepository) =>
        new EventLogsGetBySessionId(repository),
      inject: ['EventLogRepository'],
    },
    {
      provide: 'EventLogsGetByEventId',
      useFactory: (repository: TypeOrmEventLogsRepository) =>
        new EventLogsGetByEventId(repository),
      inject: ['EventLogRepository'],
    },
    {
      provide: 'EventLogsUpdate',
      useFactory: (repository: TypeOrmEventLogsRepository) =>
        new EventLogsUpdate(repository),
      inject: ['EventLogRepository'],
    },
    {
      provide: 'EventLogsDelete',
      useFactory: (repository: TypeOrmEventLogsRepository) =>
        new EventLogsDelete(repository),
      inject: ['EventLogRepository'],
    },
  ],
  exports: ['EventLogRepository', 'EventLogsCreate'],
})
export class EventLogsModule {}