import { Module } from '@nestjs/common';
import { SessionsController } from './sessions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Session } from './infrastructure/TypeOrm/TypeOrmSessionsEntity';
@Module({
  imports: [TypeOrmModule.forFeature([Session])],
  controllers: [SessionsController],
  providers: [
    {
      provide: 'startSession',
      useFactory: () => {
        return;
      },
      inject: [],
    },
  ],
})
export class SessionsModule {}
