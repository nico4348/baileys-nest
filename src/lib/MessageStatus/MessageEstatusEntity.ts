import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { TypeOrmMessagesEntity } from '../Messages/infrastructure/TypeOrm/TypeOrmMessagesEntity';
import { Status } from '../Status/StatusEntity';

@Entity('message_status')
export class MessageStatus {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Column({ type: 'uuid' })
  message_id: string;

  @Column({ type: 'uuid' })
  status_id: string;

  @Column({ type: 'timestamp' })
  updated_at: Date;
  // Relación Many-to-One con Message
  @ManyToOne(() => TypeOrmMessagesEntity, (message) => message.messageStatus)
  @JoinColumn({ name: 'message_id' })
  message: TypeOrmMessagesEntity;

  // Relación Many-to-One con Status
  @ManyToOne(() => Status, (status) => status.messageStatuses)
  @JoinColumn({ name: 'status_id' })
  status: Status;
}
