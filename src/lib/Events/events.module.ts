import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventsController } from './events.controller';
import { TypeOrmEventsEntity } from './infrastructure/TypeOrm/TypeOrmEventsEntity';
import { TypeOrmEventsRepository } from './infrastructure/TypeOrm/TypeOrmEventsRepository';
import { EventsCreate } from './application/EventsCreate';
import { EventsGetAll } from './application/EventsGetAll';
import { EventsGetOneById } from './application/EventsGetOneById';
import { EventsGetOneByName } from './application/EventsGetOneByName';
import { EventsUpdate } from './application/EventsUpdate';
import { EventsDelete } from './application/EventsDelete';
import { EventSeeder } from './infrastructure/EventSeeder';

@Module({
  imports: [TypeOrmModule.forFeature([TypeOrmEventsEntity])],
  controllers: [EventsController],
  providers: [
    {
      provide: 'EventRepository',
      useClass: TypeOrmEventsRepository,
    },
    {
      provide: 'EventsCreate',
      useFactory: (repository: TypeOrmEventsRepository) =>
        new EventsCreate(repository),
      inject: ['EventRepository'],
    },
    {
      provide: 'EventsGetAll',
      useFactory: (repository: TypeOrmEventsRepository) =>
        new EventsGetAll(repository),
      inject: ['EventRepository'],
    },
    {
      provide: 'EventsGetOneById',
      useFactory: (repository: TypeOrmEventsRepository) =>
        new EventsGetOneById(repository),
      inject: ['EventRepository'],
    },
    {
      provide: 'EventsGetOneByName',
      useFactory: (repository: TypeOrmEventsRepository) =>
        new EventsGetOneByName(repository),
      inject: ['EventRepository'],
    },
    {
      provide: 'EventsUpdate',
      useFactory: (repository: TypeOrmEventsRepository) =>
        new EventsUpdate(repository),
      inject: ['EventRepository'],
    },
    {
      provide: 'EventsDelete',
      useFactory: (repository: TypeOrmEventsRepository) =>
        new EventsDelete(repository),
      inject: ['EventRepository'],
    },
    {
      provide: EventSeeder,
      useFactory: (eventsCreate: EventsCreate, eventsGetAll: EventsGetAll) =>
        new EventSeeder(eventsCreate, eventsGetAll),
      inject: ['EventsCreate', 'EventsGetAll'],
    },
  ],
  exports: [
    'EventRepository',
    'EventsCreate',
    'EventsGetAll',
    'EventsGetOneById',
    'EventsGetOneByName',
    EventSeeder,
  ],
})
export class EventsModule {}
