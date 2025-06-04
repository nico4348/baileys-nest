import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { DatabaseProvider } from './database.providers';
import { SessionsModule } from './lib/Sessions/sessions.module';
import { AuthModule } from './lib/AuthState/authState.module';
import { SessionLogsModule } from './lib/SessionLogs/sessionLogs.module';
import { EventsModule } from './lib/Events/events.module';
import { EventLogsModule } from './lib/EventLogs/eventLogs.module';
import { MessagesModule } from './lib/Messages/messages.module';
import { TextMessagesModule } from './lib/TextMessages/textMessages.module';
import { MediaMessagesModule } from './lib/MediaMessages/mediaMessages.module';
import { ReactionMessagesModule } from './lib/ReactionMessages/reactionMessages.module';
import { StatusModule } from './lib/Status/status.module';
import { MessageStatusModule } from './lib/MessageStatus/messageStatus.module';
import { SessionMediaModule } from './lib/SessionMedia/sessionMedia.module';

@Module({
  imports: [
    BullModule.forRoot({
      redis: 'redis://default:6gYTbWK4SnusWV06uIGaEzTo2sw5QqyR@redis-18736.c99.us-east-1-4.ec2.redns.redis-cloud.com:18736',
    }),
    DatabaseProvider,
    SessionsModule,
    AuthModule,
    SessionLogsModule,
    EventsModule,
    EventLogsModule,
    MessagesModule,
    TextMessagesModule,
    MediaMessagesModule,
    ReactionMessagesModule,
    StatusModule,
    MessageStatusModule,
    SessionMediaModule,
  ],
})
export class AppModule {}
