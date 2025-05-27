import { Module } from '@nestjs/common';
import { DatabaseProvider } from './database.providers';
import { SessionsModule } from './lib/Sessions/sessions.module';
import { AuthModule } from './lib/AuthState/authState.module';
import { SessionLogsModule } from './lib/SessionLogs/sessionLogs.module';

@Module({
  imports: [DatabaseProvider, SessionsModule, AuthModule, SessionLogsModule],
})
export class AppModule {}
