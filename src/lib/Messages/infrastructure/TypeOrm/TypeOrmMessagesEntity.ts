import {
  Entity,
  PrimaryGeneratedColumn,
  PrimaryColumn,
  Column,
  ManyToOne,
  OneToMany,
  OneToOne,
  JoinColumn,
  TableInheritance,
} from 'typeorm';
import { TypeOrmSessionsEntity } from '../../../Sessions/infrastructure/TypeOrm/TypeOrmSessionsEntity';
import { TypeOrmMessageStatusEntity } from '../../../MessageStatus/infrastructure/TypeOrm/TypeOrmMessageStatusEntity';
import { TypeOrmTextMessagesEntity } from '../../../TextMessages/infrastructure/TypeOrm/TypeOrmTextMessagesEntity';
import { TypeOrmMediaMessagesEntity } from '../../../MediaMessages/infrastructure/TypeOrm/TypeOrmMediaMessagesEntity';
import { TypeOrmReactionMessagesEntity } from '../../../ReactionMessages/infrastructure/TypeOrm/TypeOrmReactionMessagesEntity';

@Entity('messages')
export class TypeOrmMessagesEntity {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Column({ type: 'json' })
  baileys_json: any;

  @Column({ type: 'uuid' })
  session_id: string;

  @Column({ type: 'uuid', nullable: true })
  quoted_message_id: string | null;

  @Column({ type: 'varchar', length: 50 })
  to: string;

  @Column({ type: 'varchar', length: 50 })
  message_type: string;

  @Column({ type: 'boolean', default: false })
  from_me: boolean;

  @Column({ type: 'timestamp' })
  created_at: Date;

  @ManyToOne(() => TypeOrmSessionsEntity, (session) => session.messages)
  @JoinColumn({ name: 'session_id' })
  session: TypeOrmSessionsEntity;

  @OneToMany(() => TypeOrmMessageStatusEntity, (messageStatus) => messageStatus.message)
  messageStatus: TypeOrmMessageStatusEntity[];

  @OneToOne(
    () => TypeOrmTextMessagesEntity,
    (textMessage) => textMessage.message,
  )
  textMessage: TypeOrmTextMessagesEntity;

  @OneToOne(
    () => TypeOrmMediaMessagesEntity,
    (mediaMessage) => mediaMessage.message,
  )
  mediaMessage: TypeOrmMediaMessagesEntity;

  @OneToMany(
    () => TypeOrmReactionMessagesEntity,
    (reactionMessage) => reactionMessage.message,
  )
  reactions: TypeOrmReactionMessagesEntity[];
}
