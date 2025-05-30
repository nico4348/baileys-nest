import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmStatusEntity } from './infrastructure/TypeOrm/TypeOrmStatusEntity';
import { TypeOrmStatusRepository } from './infrastructure/TypeOrm/TypeOrmStatusRepository';
import { StatusSeeder } from './infrastructure/StatusSeeder';
import { StatusCreate } from './application/StatusCreate';
import { StatusGetAll } from './application/StatusGetAll';
import { StatusGetOneById } from './application/StatusGetOneById';
import { StatusGetOneByName } from './application/StatusGetOneByName';
import { StatusUpdate } from './application/StatusUpdate';
import { StatusDelete } from './application/StatusDelete';
import { StatusController } from './status.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TypeOrmStatusEntity])],
  controllers: [StatusController],
  providers: [
    {
      provide: 'StatusRepository',
      useClass: TypeOrmStatusRepository,
    },
    StatusSeeder,
    StatusCreate,
    StatusGetAll,
    StatusGetOneById,
    StatusGetOneByName,
    StatusUpdate,
    StatusDelete,
  ],
  exports: [
    'StatusRepository',
    StatusSeeder,
    StatusCreate,
    StatusGetAll,
    StatusGetOneById,
    StatusGetOneByName,
    StatusUpdate,
    StatusDelete,
  ],
})
export class StatusModule {}