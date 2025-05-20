import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import { SessionLogs } from '../SessionLogs/SessionLogsEntity';
import { Message } from '../Messages/MessagesEntity';
import { EventLog } from '../EventLogs/EventLogsEntity';

@Entity('sessions')
export class Session {
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

  @OneToMany(() => SessionLogs, (sessionLog) => sessionLog.session)
  sessionLogs: SessionLogs[];

  @OneToMany(() => Message, (message) => message.session)
  messages: Message[];

  @OneToMany(() => EventLog, (eventLog) => eventLog.session)
  eventLogs: EventLog[];
}
