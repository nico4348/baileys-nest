import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Session } from '../Sessions/infrastructure/TypeOrm/TypeOrmSessionsEntity';
import { MessageStatus } from '../MessageStatus/MessageEstatusEntity';
import { TextMessage } from '../TextMessages/TextMessagesEntity';
import { MediaMessage } from '../MediaMessages/MediaMessagesEntity';
import { ReactionMessage } from '../ReactionMessages/ReactionMessagesEntity';

@Entity('messages')
export class Message {
  @PrimaryColumn({ type: 'varchar', length: 25 })
  id: string;

  @Column({ type: 'uuid' })
  session_id: string;

  @Column({ type: 'varchar', length: 25, nullable: true })
  quoted_message_id: string;

  @Column({ type: 'varchar', length: 50 })
  to: string;

  @Column({ type: 'varchar', length: 50 })
  message_type: string;

  @Column({ type: 'varchar', length: 3 })
  in_out: string;

  @Column({ type: 'timestamp' })
  created_at: Date;

  @ManyToOne(() => Session, (session) => session.messages)
  @JoinColumn({ name: 'session_id' })
  session: Session;

  @OneToOne(() => TextMessage, (textMessage) => textMessage.message)
  textMessage: TextMessage;

  @OneToOne(() => MediaMessage, (mediaMessage) => mediaMessage.message)
  mediaMessage: MediaMessage;

  @OneToMany(
    () => ReactionMessage,
    (reactionMessage) => reactionMessage.message,
  )
  reactions: ReactionMessage[];

  @OneToMany(
    () => ReactionMessage,
    (reactionMessage) => reactionMessage.targetMessage,
  )
  targetReactions: ReactionMessage[];

  @ManyToOne(() => Message, (message) => message.quotedMessages)
  @JoinColumn({ name: 'quoted_message_id' })
  quotedMessage: Message;

  @OneToMany(() => Message, (message) => message.quotedMessage)
  quotedMessages: Message[];

  @OneToMany(() => MessageStatus, (messageStatus) => messageStatus.message)
  messageStatuses: MessageStatus[];
}
