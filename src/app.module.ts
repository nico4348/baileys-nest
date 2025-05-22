import { Module } from '@nestjs/common';
import { DatabaseProvider } from './database.providers';
import { SessionsModule } from './lib/Sessions/sessions.module';
import { AuthModule } from './lib/AuthState/authState.module';

@Module({
  imports: [DatabaseProvider, SessionsModule, AuthModule],
})
export class AppModule {}
