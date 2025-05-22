import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmSessionsEntity } from './lib/Sessions/infrastructure/TypeOrm/TypeOrmSessionsEntity';
import { EventLog } from './lib/EventLogs/EventLogsEntity';
import { Event } from './lib/Events/EventsEntity';
import { MediaMessage } from './lib/MediaMessages/MediaMessagesEntity';
import { Message } from './lib/Messages/MessagesEntity';
import { MessageStatus } from './lib/MessageStatus/MessageEstatusEntity';
import { ReactionMessage } from './lib/ReactionMessages/ReactionMessagesEntity';
import { SessionLogs } from './lib/SessionLogs/SessionLogsEntity';
import { Status } from './lib/Status/StatusEntity';
import { TextMessage } from './lib/TextMessages/TextMessagesEntity';
import { AuthDataEntity } from './lib/AuthState/infraestructure/TypeOrm/AuthDataEntity';

export const DatabaseProvider = TypeOrmModule.forRoot({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'root',
  database: 'pruebaNest',
  entities: [
    TypeOrmSessionsEntity,
    EventLog,
    Event,
    MediaMessage,
    Message,
    MessageStatus,
    ReactionMessage,
    SessionLogs,
    Status,
    TextMessage,
    AuthDataEntity,
  ],
  synchronize: true,
  retryAttempts: 2,
  retryDelay: 30000,
});
