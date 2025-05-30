import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { TypeOrmMessagesEntity } from '../../../Messages/infrastructure/TypeOrm/TypeOrmMessagesEntity';

@Entity('reaction_messages')
export class TypeOrmReactionMessagesEntity {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Column({ type: 'uuid' })
  message_id: string;
  @Column({ type: 'varchar', length: 5 })
  emoji: string;

  @Column({ type: 'uuid' })
  target_msg_id: string;

  @ManyToOne(() => TypeOrmMessagesEntity, (message) => message.reactions)
  @JoinColumn({ name: 'message_id' })
  message: TypeOrmMessagesEntity;
}
