import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import { MessageStatus } from '../MessageStatus/MessageEstatusEntity';

@Entity('status')
export class Status {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Column({ type: 'varchar', length: 30, unique: true })
  name: string;

  @Column({ type: 'varchar', length: 255 })
  description: string;

  @Column({ type: 'timestamp' })
  created_at: Date;

  @OneToMany(() => MessageStatus, (messageStatus) => messageStatus.status)
  messageStatuses: MessageStatus[];
}
