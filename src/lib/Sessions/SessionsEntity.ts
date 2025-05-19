import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import { SessionLog } from '../SessionLogs/SessionLogs';
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

  @OneToMany(() => SessionLog, (sessionLog) => sessionLog.session)
  sessionLogs: SessionLog[];

  @OneToMany(() => Message, (message) => message.session)
  messages: Message[];

  @OneToMany(() => EventLog, (eventLog) => eventLog.session)
  eventLogs: EventLog[];
}
