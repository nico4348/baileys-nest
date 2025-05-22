import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthDataEntity } from './infraestructure/TypeOrm/AuthDataEntity';
import { AuthDataTypeOrmRepository } from './infraestructure/TypeOrm/AuthDataTypeOrmRepository';
import { AuthStateServiceImpl } from './infraestructure/AuthStateServiceImpl';
import { AuthStateController } from './authState.service';
import { AuthStateFactory } from './infraestructure/AuthStateFactory';

@Module({
  imports: [TypeOrmModule.forFeature([AuthDataEntity])],
  providers: [
    {
      provide: 'AuthDataRepository',
      useClass: AuthDataTypeOrmRepository,
    },
    {
      provide: 'AuthStateService',
      useFactory: (repository: AuthDataTypeOrmRepository) =>
        new AuthStateServiceImpl(repository),
      inject: ['AuthDataRepository'],
    },
    {
      provide: AuthStateFactory,
      useFactory: (service: AuthStateServiceImpl) =>
        new AuthStateFactory(service),
      inject: ['AuthStateService'],
    },
  ],
  controllers: [AuthStateController],
  exports: ['AuthStateService', AuthStateFactory],
})
export class AuthModule {}
