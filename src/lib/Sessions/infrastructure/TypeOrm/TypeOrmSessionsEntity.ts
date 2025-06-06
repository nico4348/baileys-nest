import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import { TypeOrmSessionLogsEntity } from '../../../SessionLogs/infrastructure/TypeOrm/TypeOrmSessionLogsEntity';
import { TypeOrmMessagesEntity } from '../../../Messages/infrastructure/TypeOrm/TypeOrmMessagesEntity';
import { TypeOrmEventLogsEntity } from '../../../EventLogs/infrastructure/TypeOrm/TypeOrmEventLogsEntity';
import { TypeOrmSessionMediaEntity } from '../../../SessionMedia/infrastructure/TypeOrm/TypeOrmSessionMediaEntity';

@Entity('sessions')
export class TypeOrmSessionsEntity {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Column({ type: 'varchar', length: 100 })
  session_name: string;

  @Column({ type: 'varchar', length: 25 })
  phone: string;

  @Column({ type: 'boolean' })
  status: boolean;

  @Column({ type: 'timestamp' })
  created_at: Date;

  @Column({ type: 'timestamp' })
  updated_at: Date;

  @Column({ type: 'boolean' })
  is_deleted: boolean;

  @Column({ type: 'timestamp', nullable: true })
  deleted_at: Date | null;

  @Column({ type: 'integer', default: 30 })
  rate_limit: number;

  @OneToMany(() => TypeOrmSessionLogsEntity, (sessionLog) => sessionLog.session)
  sessionLogs: TypeOrmSessionLogsEntity[];
  
  @OneToMany(() => TypeOrmMessagesEntity, (message) => message.session)
  messages: TypeOrmMessagesEntity[];
  
  @OneToMany(() => TypeOrmEventLogsEntity, (eventLog) => eventLog.session)
  eventLogs: TypeOrmEventLogsEntity[];
  
  @OneToMany(() => TypeOrmSessionMediaEntity, (sessionMedia) => sessionMedia.session)
  sessionMedia: TypeOrmSessionMediaEntity[];
}
