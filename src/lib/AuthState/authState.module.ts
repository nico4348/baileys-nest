import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthDataEntity } from './infrastructure/TypeOrm/AuthDataEntity';
import { AuthStateTypeOrmRepository } from './infrastructure/TypeOrm/AuthDataTypeOrmRepository';
import { AuthStateFactory } from './infrastructure/AuthStateFactory';
import { AuthStateService } from './infrastructure/AuthStateService';
import { AuthCredsInit } from './application/AuthCredsInit';

@Module({
  imports: [TypeOrmModule.forFeature([AuthDataEntity])],
  providers: [
    AuthStateTypeOrmRepository,
    AuthCredsInit,
    AuthStateService,
    AuthStateFactory,
    {
      provide: 'AuthStateRepository',
      useClass: AuthStateTypeOrmRepository,
    },
    {
      provide: 'AuthStateFactory',
      useClass: AuthStateFactory,
    },
  ],
  exports: [
    'AuthStateRepository',
    'AuthStateFactory',
    AuthStateService,
    AuthStateFactory,
  ],
})
export class AuthModule {}
