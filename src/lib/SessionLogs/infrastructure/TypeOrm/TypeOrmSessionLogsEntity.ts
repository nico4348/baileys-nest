import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { TypeOrmSessionsEntity } from '../../../Sessions/infrastructure/TypeOrm/TypeOrmSessionsEntity';

@Entity('session_logs')
@Index(['session_id', 'created_at'])
@Index(['log_type', 'created_at'])
export class TypeOrmSessionLogsEntity {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Column({ type: 'uuid', name: 'session_id' })
  session_id: string;

  @Column({ type: 'varchar', length: 20, name: 'log_type' })
  log_type: string;
  @Column({ type: 'text', name: 'message' })
  message: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  created_at: Date;

  @ManyToOne(() => TypeOrmSessionsEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'session_id' })
  session: TypeOrmSessionsEntity;
}
