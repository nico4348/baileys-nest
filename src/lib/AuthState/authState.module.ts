import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthDataEntity } from './infrastructure/TypeOrm/AuthDataEntity';
import { AuthStateTypeOrmRepository } from './infrastructure/TypeOrm/AuthDataTypeOrmRepository';
import { AuthStateFactory } from './infrastructure/AuthStateFactory';
import { AuthCredsInit } from './application/AuthCredsInit';
import { AuthStateGet } from './application/AuthStateGet';
import { AuthStateSaveCredentials } from './application/AuthStateSaveCredentials';
import { AuthStateDeleteSession } from './application/AuthStateDeleteSession';

@Module({
  imports: [TypeOrmModule.forFeature([AuthDataEntity])],
  providers: [
    AuthStateTypeOrmRepository,
    AuthCredsInit,
    AuthStateFactory,
    {
      provide: 'AuthStateRepository',
      useClass: AuthStateTypeOrmRepository,
    },
    {
      provide: 'AuthStateFactory',
      useClass: AuthStateFactory,
    },
    {
      provide: 'AuthStateGet',
      useFactory: (
        repository: AuthStateTypeOrmRepository,
        authCredsInit: AuthCredsInit,
      ) => new AuthStateGet(repository, authCredsInit),
      inject: ['AuthStateRepository', AuthCredsInit],
    },
    {
      provide: 'AuthStateSaveCredentials',
      useFactory: (repository: AuthStateTypeOrmRepository) =>
        new AuthStateSaveCredentials(repository),
      inject: ['AuthStateRepository'],
    },
    {
      provide: 'AuthStateDeleteSession',
      useFactory: (repository: AuthStateTypeOrmRepository) =>
        new AuthStateDeleteSession(repository),
      inject: ['AuthStateRepository'],
    },
  ],
  exports: [
    'AuthStateRepository',
    'AuthStateFactory',
    'AuthStateGet',
    'AuthStateSaveCredentials',
    'AuthStateDeleteSession',
    AuthStateFactory,
  ],
})
export class AuthModule {}
