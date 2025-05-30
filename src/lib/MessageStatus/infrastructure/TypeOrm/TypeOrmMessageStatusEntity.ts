import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { TypeOrmMessagesEntity } from '../../../Messages/infrastructure/TypeOrm/TypeOrmMessagesEntity';
import { TypeOrmStatusEntity } from '../../../Status/infrastructure/TypeOrm/TypeOrmStatusEntity';

@Entity('message_status')
export class TypeOrmMessageStatusEntity {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Column({ type: 'uuid' })
  message_id: string;

  @Column({ type: 'uuid' })
  status_id: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @ManyToOne(() => TypeOrmMessagesEntity, (message) => message.messageStatus)
  @JoinColumn({ name: 'message_id' })
  message: TypeOrmMessagesEntity;

  @ManyToOne(() => TypeOrmStatusEntity, (status) => status.messageStatuses)
  @JoinColumn({ name: 'status_id' })
  status: TypeOrmStatusEntity;
}