import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { TypeOrmMessagesEntity } from '../../../Messages/infrastructure/TypeOrm/TypeOrmMessagesEntity';

@Entity('media_messages')
export class TypeOrmMediaMessagesEntity {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Column({ type: 'varchar', length: 25 })
  message_id: string;

  @Column({ type: 'varchar', length: 4096, nullable: true })
  caption: string | null;

  @Column({ type: 'varchar', length: 50 })
  media_type: string;

  @Column({ type: 'varchar', length: 20 })
  mime_type: string;

  @Column({ type: 'varchar', length: 255 })
  file_name: string;

  @Column({ type: 'text' })
  file_path: string;

  @OneToOne(() => TypeOrmMessagesEntity, (message) => message.mediaMessage)
  @JoinColumn({ name: 'message_id' })
  message: TypeOrmMessagesEntity;
}