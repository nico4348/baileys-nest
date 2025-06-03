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
import { MessageCreatedAt } from '../../domain/MessageCreatedAt';
import { MessageBaileysJson } from '../../domain/MessageBaileysJson';
import { MessageFromMe } from '../../domain/MessageFromMe';

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
      relations: ['session'],
    });

    return messageEntities.map((entity) => this.toDomain(entity));
  }
  async getOneById(id: MessageId): Promise<Message | null> {
    const messageEntity = await this.repository.findOne({
      where: { id: id.value },
      relations: ['session'],
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
      relations: ['session'],
    });

    return messageEntities.map((entity) => this.toDomain(entity));
  }

  async findByBaileysId(baileysMessageId: string, sessionId: MessageSessionId): Promise<Message | null> {
    // Buscar mensaje donde el baileys_json contenga el ID de Baileys
    // El ID de Baileys generalmente está en baileys_json.key.id
    const messageEntity = await this.repository
      .createQueryBuilder('message')
      .where('message.session_id = :sessionId', { sessionId: sessionId.value })
      .andWhere("message.baileys_json->'key'->>'id' = :baileysId", { baileysId: baileysMessageId })
      .getOne();

    if (!messageEntity) {
      return null;
    }

    return this.toDomain(messageEntity);
  }

  async update(message: Message): Promise<Message> {
    const messageEntity = this.toEntity(message);
    await this.repository.update(message.id.value, messageEntity);
    const updatedEntity = await this.repository.findOne({
      where: { id: message.id.value },
      relations: ['session'],
    });

    if (!updatedEntity) {
      throw new Error(
        `Message with id ${message.id.value} not found after update`,
      );
    }

    return this.toDomain(updatedEntity);
  }

  async delete(id: MessageId): Promise<void> {
    await this.repository.delete(id.value);
  }
  private toEntity(message: Message): TypeOrmMessagesEntity {
    const entity = new TypeOrmMessagesEntity();
    entity.id = message.id.value;
    entity.baileys_json = message.baileys_json.value;
    entity.session_id = message.session_id.value;
    entity.quoted_message_id = message.quoted_message_id.value || null;
    entity.to = message.to.value;
    entity.message_type = message.message_type.value;
    entity.from_me = message.from_me.value;
    entity.created_at = message.created_at.value;
    return entity;
  }

  private toDomain(entity: TypeOrmMessagesEntity): Message {
    return new Message(
      new MessageId(entity.id),
      new MessageBaileysJson(entity.baileys_json),
      new MessageSessionId(entity.session_id),
      new MessageQuotedMessageId(entity.quoted_message_id),
      new MessageTo(entity.to),
      new MessageMessageType(entity.message_type),
      new MessageFromMe(entity.from_me),
      new MessageCreatedAt(entity.created_at),
    );
  }
}
