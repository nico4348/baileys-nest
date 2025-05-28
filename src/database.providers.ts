import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmSessionsEntity } from './lib/Sessions/infrastructure/TypeOrm/TypeOrmSessionsEntity';
import { TypeOrmEventLogsEntity } from './lib/EventLogs/infrastructure/TypeOrm/TypeOrmEventLogsEntity';
import { TypeOrmEventsEntity } from './lib/Events/infrastructure/TypeOrm/TypeOrmEventsEntity';
import { TypeOrmMessagesEntity } from './lib/Messages/infrastructure/TypeOrm/TypeOrmMessagesEntity';
import { TypeOrmTextMessagesEntity } from './lib/TextMessages/infrastructure/TypeOrm/TypeOrmTextMessagesEntity';
import { TypeOrmMediaMessagesEntity } from './lib/MediaMessages/infrastructure/TypeOrm/TypeOrmMediaMessagesEntity';
import { TypeOrmReactionMessagesEntity } from './lib/ReactionMessages/infrastructure/TypeOrm/TypeOrmReactionMessagesEntity';
import { MediaMessage } from './lib/MediaMessages/MediaMessagesEntity';
import { Message } from './lib/Messages/MessagesEntity';
import { MessageStatus } from './lib/MessageStatus/MessageEstatusEntity';
import { ReactionMessage } from './lib/ReactionMessages/ReactionMessagesEntity';
import { TypeOrmSessionLogsEntity } from './lib/SessionLogs/infrastructure/TypeOrm/TypeOrmSessionLogsEntity';
import { Status } from './lib/Status/StatusEntity';
import { TextMessage } from './lib/TextMessages/TextMessagesEntity';
import { AuthDataEntity } from './lib/AuthState/infrastructure/TypeOrm/AuthDataEntity';

export const DatabaseProvider = TypeOrmModule.forRoot({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'root',
  database: 'pruebaNest',
  entities: [
    TypeOrmSessionsEntity,
    TypeOrmEventLogsEntity,
    TypeOrmEventsEntity,
    TypeOrmMessagesEntity,
    TypeOrmTextMessagesEntity,
    TypeOrmMediaMessagesEntity,
    TypeOrmReactionMessagesEntity,
    MediaMessage,
    Message,
    MessageStatus,
    ReactionMessage,
    TypeOrmSessionLogsEntity,
    Status,
    TextMessage,
    AuthDataEntity,
  ],
  synchronize: true,
  retryAttempts: 2,
  retryDelay: 30000,
});
