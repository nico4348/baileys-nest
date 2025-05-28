import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TypeOrmTextMessagesEntity } from './TypeOrmTextMessagesEntity';
import { TextMessageRepository } from '../../domain/TextMessageRepository';
import { TextMessage } from '../../domain/TextMessage';
import { TextMessageId } from '../../domain/TextMessageId';
import { TextMessageMessageId } from '../../domain/TextMessageMessageId';
import { TextMessageBody } from '../../domain/TextMessageBody';

@Injectable()
export class TypeOrmTextMessagesRepository implements TextMessageRepository {
  constructor(
    @InjectRepository(TypeOrmTextMessagesEntity)
    private readonly repository: Repository<TypeOrmTextMessagesEntity>,
  ) {}

  async create(textMessage: TextMessage): Promise<void> {
    const textMessageEntity = this.toEntity(textMessage);
    await this.repository.save(textMessageEntity);
  }

  async getAll(): Promise<TextMessage[]> {
    const textMessageEntities = await this.repository.find({
      relations: ['message'],
      order: { message: { created_at: 'DESC' } },
    });

    return textMessageEntities.map((entity) => this.toDomain(entity));
  }

  async getOneById(id: TextMessageId): Promise<TextMessage | null> {
    const textMessageEntity = await this.repository.findOne({
      where: { id: id.value },
      relations: ['message'],
    });

    if (!textMessageEntity) {
      return null;
    }

    return this.toDomain(textMessageEntity);
  }

  async getByMessageId(messageId: string): Promise<TextMessage | null> {
    const textMessageEntity = await this.repository.findOne({
      where: { message_id: messageId },
      relations: ['message'],
    });

    if (!textMessageEntity) {
      return null;
    }

    return this.toDomain(textMessageEntity);
  }

  async getBySessionId(sessionId: string): Promise<TextMessage[]> {
    const textMessageEntities = await this.repository.find({
      where: { message: { session_id: sessionId } },
      relations: ['message'],
      order: { message: { created_at: 'DESC' } },
    });

    return textMessageEntities.map((entity) => this.toDomain(entity));
  }

  async update(textMessage: TextMessage): Promise<void> {
    const textMessageEntity = this.toEntity(textMessage);
    await this.repository.update(textMessage.id.value, textMessageEntity);
  }

  async delete(id: TextMessageId): Promise<void> {
    await this.repository.delete(id.value);
  }

  async deleteByMessageId(messageId: string): Promise<void> {
    await this.repository.delete({ message_id: messageId });
  }

  private toEntity(textMessage: TextMessage): TypeOrmTextMessagesEntity {
    const entity = new TypeOrmTextMessagesEntity();
    entity.id = textMessage.id.value;
    entity.message_id = textMessage.id_message.value;
    entity.body = textMessage.body.value;
    return entity;
  }

  private toDomain(entity: TypeOrmTextMessagesEntity): TextMessage {
    return new TextMessage(
      new TextMessageId(entity.id),
      new TextMessageMessageId(entity.message_id),
      new TextMessageBody(entity.body),
    );
  }
}