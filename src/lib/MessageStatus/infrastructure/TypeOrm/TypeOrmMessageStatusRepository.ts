import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MessageStatusRepository } from '../../domain/MessageStatusRepository';
import { MessageStatus } from '../../domain/MessageStatus';
import { MessageStatusId } from '../../domain/MessageStatusId';
import { MessageStatusMessageId } from '../../domain/MessageStatusMessageId';
import { MessageStatusStatusId } from '../../domain/MessageStatusStatusId';
import { TypeOrmMessageStatusEntity } from './TypeOrmMessageStatusEntity';
import { MessageStatusCreatedAt } from '../../domain/MessageStatusCreatedAt';

@Injectable()
export class TypeOrmMessageStatusRepository implements MessageStatusRepository {
  constructor(
    @InjectRepository(TypeOrmMessageStatusEntity)
    private readonly messageStatusRepository: Repository<TypeOrmMessageStatusEntity>,
  ) {}

  async save(messageStatus: MessageStatus): Promise<void> {
    const messageStatusEntity = new TypeOrmMessageStatusEntity();
    messageStatusEntity.id = messageStatus.id.value;
    messageStatusEntity.message_id = messageStatus.message_id.value;
    messageStatusEntity.status_id = messageStatus.status_id.value;
    messageStatusEntity.created_at = messageStatus.created_at.value;

    await this.messageStatusRepository.save(messageStatusEntity);
  }

  async findById(id: MessageStatusId): Promise<MessageStatus | null> {
    const messageStatusEntity = await this.messageStatusRepository.findOne({
      where: { id: id.value },
    });

    if (!messageStatusEntity) {
      return null;
    }

    return new MessageStatus(
      new MessageStatusId(messageStatusEntity.id),
      new MessageStatusMessageId(messageStatusEntity.message_id),
      new MessageStatusStatusId(messageStatusEntity.status_id),
      new MessageStatusCreatedAt(messageStatusEntity.created_at),
    );
  }

  async findByMessageId(messageId: MessageStatusMessageId): Promise<MessageStatus[]> {
    const messageStatusEntities = await this.messageStatusRepository.find({
      where: { message_id: messageId.value },
      order: { created_at: 'DESC' },
    });

    return messageStatusEntities.map(
      (entity) =>
        new MessageStatus(
          new MessageStatusId(entity.id),
          new MessageStatusMessageId(entity.message_id),
          new MessageStatusStatusId(entity.status_id),
          new MessageStatusCreatedAt(entity.created_at),
        ),
    );
  }

  async findAll(): Promise<MessageStatus[]> {
    const messageStatusEntities = await this.messageStatusRepository.find({
      order: { created_at: 'DESC' },
    });

    return messageStatusEntities.map(
      (entity) =>
        new MessageStatus(
          new MessageStatusId(entity.id),
          new MessageStatusMessageId(entity.message_id),
          new MessageStatusStatusId(entity.status_id),
          new MessageStatusCreatedAt(entity.created_at),
        ),
    );
  }

  async findLatestByMessageId(messageId: MessageStatusMessageId): Promise<MessageStatus | null> {
    const messageStatusEntity = await this.messageStatusRepository.findOne({
      where: { message_id: messageId.value },
      order: { created_at: 'DESC' },
    });

    if (!messageStatusEntity) {
      return null;
    }

    return new MessageStatus(
      new MessageStatusId(messageStatusEntity.id),
      new MessageStatusMessageId(messageStatusEntity.message_id),
      new MessageStatusStatusId(messageStatusEntity.status_id),
      new MessageStatusCreatedAt(messageStatusEntity.created_at),
    );
  }

  async delete(id: MessageStatusId): Promise<void> {
    await this.messageStatusRepository.delete({ id: id.value });
  }

}