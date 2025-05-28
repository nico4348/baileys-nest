import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { TypeOrmMessagesEntity } from '../../../Messages/infrastructure/TypeOrm/TypeOrmMessagesEntity';

@Entity('text_messages')
export class TypeOrmTextMessagesEntity {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Column({ type: 'varchar', length: 25 })
  message_id: string;

  @Column({ type: 'varchar', length: 4096 })
  body: string;

  @OneToOne(() => TypeOrmMessagesEntity, (message) => message.textMessage)
  @JoinColumn({ name: 'message_id' })
  message: TypeOrmMessagesEntity;
}