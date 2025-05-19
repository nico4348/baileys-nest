import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Message } from '../Messages/MessagesEntity';

@Entity('reaction_messages')
export class ReactionMessage {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Column({ type: 'uuid' })
  message_id: string;

  @Column({ type: 'varchar', length: 5 })
  emoji: string;

  @Column({ type: 'uuid' })
  target_msg_id: string;

  @ManyToOne(() => Message, (message) => message.reactions)
  @JoinColumn({ name: 'message_id' })
  message: Message;

  @ManyToOne(() => Message, (message) => message.targetReactions)
  @JoinColumn({ name: 'target_msg_id', referencedColumnName: 'id' })
  targetMessage: Message;
}
