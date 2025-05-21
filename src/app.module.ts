import { Module } from '@nestjs/common';
import { DatabaseProvider } from './database.providers';
import { SessionsModule } from './lib/Sessions/sessions.module';

@Module({
  imports: [DatabaseProvider, SessionsModule],
})
export class AppModule {}
