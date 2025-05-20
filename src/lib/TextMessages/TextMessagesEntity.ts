import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { Message } from '../Messages/MessagesEntity'; // Assuming this is the correct path

@Entity('text_messages')
export class TextMessage {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Column({ type: 'varchar', length: 25 })
  message_id: string;

  @Column({ type: 'varchar', length: 4096 })
  body: string;

  @OneToOne(() => Message, (message) => message.textMessage)
  @JoinColumn({ name: 'message_id' })
  message: Message;
}
