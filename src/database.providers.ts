import { TypeOrmModule } from '@nestjs/typeorm';
import { Session } from './lib/Sessions/SessionsEntity';
import { EventLog } from './lib/EventLogs/EventLogsEntity';
import { Event } from './lib/Events/EventsEntity';
import { MediaMessage } from './lib/MediaMessages/MediaMessagesEntity';
import { Message } from './lib/Messages/MessagesEntity';
import { MessageStatus } from './lib/MessageStatus/MessageEstatusEntity';
import { ReactionMessage } from './lib/ReactionMessages/ReactionMessagesEntity';
import { SessionLogs } from './lib/SessionLogs/SessionLogsEntity';
import { Status } from './lib/Status/StatusEntity';
import { TextMessage } from './lib/TextMessages/TextMessagesEntity';

export const DatabaseProvider = TypeOrmModule.forRoot({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'root',
  database: 'pruebaNest',
  entities: [
    Session,
    EventLog,
    Event,
    MediaMessage,
    Message,
    MessageStatus,
    ReactionMessage,
    SessionLogs,
    Status,
    TextMessage,
  ],
  synchronize: true,
});
