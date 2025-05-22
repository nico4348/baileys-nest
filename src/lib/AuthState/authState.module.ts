import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthDataEntity } from './infraestructure/TypeOrm/AuthDataEntity';
import { AuthDataTypeOrmRepository } from './infraestructure/TypeOrm/AuthDataTypeOrmRepository';
import { AuthStateServiceImpl } from './infraestructure/AuthStateServiceImpl';
import { AuthStateFactory } from './infraestructure/AuthStateFactory';
import { AuthDataRepository } from './domain/AuthDataRepository';
import { AuthStateService } from './application/AuthStateService';

@Module({
  imports: [TypeOrmModule.forFeature([AuthDataEntity])],
  providers: [
    {
      provide: 'AuthDataRepository',
      useClass: AuthDataTypeOrmRepository,
    },
    {
      provide: 'AuthStateService',
      useFactory: (repository: AuthDataRepository) =>
        new AuthStateServiceImpl(repository),
      inject: ['AuthDataRepository'],
    },
    {
      provide: 'AuthStateFactory',
      useFactory: (service: AuthStateService) => new AuthStateFactory(service),
      inject: ['AuthStateService'],
    },
  ],
  exports: ['AuthStateService', 'AuthStateFactory'],
})
export class AuthModule {}
