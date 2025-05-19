import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import { EventLog } from '../EventLogs/EventLogsEntity';

@Entity('events')
export class Event {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  event_name: string;

  @Column({ type: 'varchar', length: 500 })
  description: string;

  @Column({ type: 'timestamp' })
  created_at: Date;

  @OneToMany(() => EventLog, (eventLog) => eventLog.event)
  eventLogs: EventLog[];
}
