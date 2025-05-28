import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TypeOrmMessagesEntity } from './TypeOrmMessagesEntity';
import { MessageRepository } from '../../domain/MessageRepository';
import { Message } from '../../domain/Message';
import { MessageId } from '../../domain/MessageId';
import { MessageSessionId } from '../../domain/MessageSessionId';
import { MessageQuotedMessageId } from '../../domain/MessageQuotedMessageId';
import { MessageTo } from '../../domain/MessageTo';
import { MessageMessageType } from '../../domain/MessageMessageType';
import { MessageInOut } from '../../domain/MessageInOut';
import { MessageCreatedAt } from '../../domain/MessageCreatedAt';

@Injectable()
export class TypeOrmMessagesRepository implements MessageRepository {
  constructor(
    @InjectRepository(TypeOrmMessagesEntity)
    private readonly repository: Repository<TypeOrmMessagesEntity>,
  ) {}

  async create(message: Message): Promise<Message> {
    const messageEntity = this.toEntity(message);
    const savedEntity = await this.repository.save(messageEntity);
    return this.toDomain(savedEntity);
  }

  async getAll(): Promise<Message[]> {
    const messageEntities = await this.repository.find({
      order: { created_at: 'DESC' },
      relations: ['session', 'quotedMessage', 'textMessage', 'mediaMessage'],
    });

    return messageEntities.map((entity) => this.toDomain(entity));
  }

  async getOneById(id: MessageId): Promise<Message | null> {
    const messageEntity = await this.repository.findOne({
      where: { id: id.value },
      relations: ['session', 'quotedMessage', 'textMessage', 'mediaMessage'],
    });

    if (!messageEntity) {
      return null;
    }

    return this.toDomain(messageEntity);
  }

  async getBySessionId(sessionId: string): Promise<Message[]> {
    const messageEntities = await this.repository.find({
      where: { session_id: sessionId },
      order: { created_at: 'DESC' },
      relations: ['session', 'quotedMessage', 'textMessage', 'mediaMessage'],
    });

    return messageEntities.map((entity) => this.toDomain(entity));
  }

  async update(message: Message): Promise<Message> {
    const messageEntity = this.toEntity(message);
    await this.repository.update(message.id.value, messageEntity);
    
    const updatedEntity = await this.repository.findOne({
      where: { id: message.id.value },
      relations: ['session', 'quotedMessage', 'textMessage', 'mediaMessage'],
    });

    if (!updatedEntity) {
      throw new Error(`Message with id ${message.id.value} not found after update`);
    }

    return this.toDomain(updatedEntity);
  }

  async delete(id: MessageId): Promise<void> {
    await this.repository.delete(id.value);
  }

  private toEntity(message: Message): TypeOrmMessagesEntity {
    const entity = new TypeOrmMessagesEntity();
    entity.id = message.id.value;
    entity.session_id = message.session_id.value;
    entity.quoted_message_id = message.quoted_message_id.value || null;
    entity.to = message.to.value;
    entity.message_type = message.message_type.value;
    entity.in_out = message.in_out.value;
    entity.created_at = message.created_at.value;
    return entity;
  }

  private toDomain(entity: TypeOrmMessagesEntity): Message {
    return new Message(
      new MessageId(entity.id),
      new MessageSessionId(entity.session_id),
      new MessageQuotedMessageId(entity.quoted_message_id),
      new MessageTo(entity.to),
      new MessageMessageType(entity.message_type),
      new MessageInOut(entity.in_out),
      new MessageCreatedAt(entity.created_at),
    );
  }
}