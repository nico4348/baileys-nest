import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmSessionsEntity } from './lib/Sessions/infrastructure/TypeOrm/TypeOrmSessionsEntity';
import { TypeOrmEventLogsEntity } from './lib/EventLogs/infrastructure/TypeOrm/TypeOrmEventLogsEntity';
import { TypeOrmEventsEntity } from './lib/Events/infrastructure/TypeOrm/TypeOrmEventsEntity';
import { TypeOrmMessagesEntity } from './lib/Messages/infrastructure/TypeOrm/TypeOrmMessagesEntity';
import { TypeOrmTextMessagesEntity } from './lib/TextMessages/infrastructure/TypeOrm/TypeOrmTextMessagesEntity';
import { TypeOrmMediaMessagesEntity } from './lib/MediaMessages/infrastructure/TypeOrm/TypeOrmMediaMessagesEntity';
import { TypeOrmReactionMessagesEntity } from './lib/ReactionMessages/infrastructure/TypeOrm/TypeOrmReactionMessagesEntity';
import { TypeOrmStatusEntity } from './lib/Status/infrastructure/TypeOrm/TypeOrmStatusEntity';
import { TypeOrmMessageStatusEntity } from './lib/MessageStatus/infrastructure/TypeOrm/TypeOrmMessageStatusEntity';
import { TypeOrmSessionLogsEntity } from './lib/SessionLogs/infrastructure/TypeOrm/TypeOrmSessionLogsEntity';
import { AuthDataEntity } from './lib/AuthState/infrastructure/TypeOrm/AuthDataEntity';
import { TypeOrmSessionMediaEntity } from './lib/SessionMedia/infrastructure/TypeOrm/TypeOrmSessionMediaEntity';

export const DatabaseProvider = TypeOrmModule.forRoot({
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities: [
    TypeOrmSessionsEntity,
    TypeOrmEventLogsEntity,
    TypeOrmEventsEntity,
    TypeOrmMessagesEntity,
    TypeOrmTextMessagesEntity,
    TypeOrmMediaMessagesEntity,
    TypeOrmReactionMessagesEntity,
    TypeOrmStatusEntity,
    TypeOrmMessageStatusEntity,
    TypeOrmSessionLogsEntity,
    AuthDataEntity,
    TypeOrmSessionMediaEntity,
  ],
  synchronize: process.env.NODE_ENV !== 'production',
  migrationsRun: true,
  retryAttempts: 2,
  retryDelay: 30000,
});
