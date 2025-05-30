import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import { TypeOrmMessageStatusEntity } from '../../../MessageStatus/infrastructure/TypeOrm/TypeOrmMessageStatusEntity';

@Entity('status')
export class TypeOrmStatusEntity {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Column({ type: 'varchar', length: 30, unique: true })
  name: string;

  @Column({ type: 'varchar', length: 255 })
  description: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @OneToMany(() => TypeOrmMessageStatusEntity, (messageStatus) => messageStatus.status)
  messageStatuses: TypeOrmMessageStatusEntity[];
}