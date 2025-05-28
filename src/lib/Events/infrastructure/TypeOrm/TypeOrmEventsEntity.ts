import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import { TypeOrmEventLogsEntity } from '../../../EventLogs/infrastructure/TypeOrm/TypeOrmEventLogsEntity';

@Entity('events')
export class TypeOrmEventsEntity {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  event_name: string;

  @Column({ type: 'varchar', length: 500 })
  description: string;

  @Column({ type: 'timestamp' })
  created_at: Date;

  @OneToMany(() => TypeOrmEventLogsEntity, (eventLog) => eventLog.event)
  eventLogs: TypeOrmEventLogsEntity[];
}