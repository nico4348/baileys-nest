import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { Message } from '../Messages/MessagesEntity'; // Assuming this is the correct path

@Entity('media_messages')
export class MediaMessage {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Column({ type: 'uuid' })
  message_id: string;

  @Column({ type: 'varchar', length: 4096, nullable: true })
  caption: string;

  @Column({ type: 'varchar', length: 50 })
  media_type: string;

  @Column({ type: 'varchar', length: 20 })
  mime_type: string;

  @Column({ type: 'varchar', length: 255 })
  file_name: string;

  @Column({ type: 'text' })
  file_path: string;

  @OneToOne(() => Message, (message) => message.mediaMessage)
  @JoinColumn({ name: 'message_id' })
  message: Message;
}
