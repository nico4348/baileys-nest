import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Message } from '../Messages/MessagesEntity'; // Assuming this is the correct path
import { Status } from '../Status/StatusEntity'; // Assuming this is the correct path

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
  @ManyToOne(() => Message, (message) => message.messageStatuses)
  @JoinColumn({ name: 'message_id' })
  message: Message;

  // Relación Many-to-One con Status
  @ManyToOne(() => Status, (status) => status.messageStatuses)
  @JoinColumn({ name: 'status_id' })
  status: Status;
}
