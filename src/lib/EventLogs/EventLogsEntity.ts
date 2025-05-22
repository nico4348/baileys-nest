import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { TypeOrmSessionsEntity } from '../Sessions/infrastructure/TypeOrm/TypeOrmSessionsEntity';
import { Event } from '../Events/EventsEntity';

@Entity('event_logs')
export class EventLog {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Column({ type: 'uuid' })
  session_id: string;

  @Column({ type: 'uuid' })
  event_id: string;

  @Column({ type: 'timestamp' })
  created_at: Date;

  @ManyToOne(() => TypeOrmSessionsEntity, (session) => session.eventLogs)
  @JoinColumn({ name: 'session_id' })
  session: TypeOrmSessionsEntity;

  @ManyToOne(() => Event, (event) => event.eventLogs)
  @JoinColumn({ name: 'event_id' })
  event: Event;
}
