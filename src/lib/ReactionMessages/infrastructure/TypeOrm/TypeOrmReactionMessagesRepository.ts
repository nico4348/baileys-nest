import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TypeOrmReactionMessagesEntity } from './TypeOrmReactionMessagesEntity';
import { ReactionMessageRepository } from '../../domain/ReactionMessageRepository';
import { ReactionMessage } from '../../domain/ReactionMessage';
import { ReactionMessageId } from '../../domain/ReactionMessageId';
import { ReactionMessageMessageId } from '../../domain/ReactionMessageMessageId';
import { ReactionMessageEmoji } from '../../domain/ReactionMessageEmoji';
import { ReactionMessageTargetMsgId } from '../../domain/ReactionMessageTargetMsgId';

@Injectable()
export class TypeOrmReactionMessagesRepository implements ReactionMessageRepository {
  constructor(
    @InjectRepository(TypeOrmReactionMessagesEntity)
    private readonly repository: Repository<TypeOrmReactionMessagesEntity>,
  ) {}

  async create(reactionMessage: ReactionMessage): Promise<void> {
    const reactionMessageEntity = this.toEntity(reactionMessage);
    await this.repository.save(reactionMessageEntity);
  }

  async getAll(): Promise<ReactionMessage[]> {
    const reactionMessageEntities = await this.repository.find({
      relations: ['message', 'targetMessage'],
      order: { message: { created_at: 'DESC' } },
    });

    return reactionMessageEntities.map((entity) => this.toDomain(entity));
  }

  async getOneById(id: ReactionMessageId): Promise<ReactionMessage | null> {
    const reactionMessageEntity = await this.repository.findOne({
      where: { id: id.value },
      relations: ['message', 'targetMessage'],
    });

    if (!reactionMessageEntity) {
      return null;
    }

    return this.toDomain(reactionMessageEntity);
  }

  async getByMessageId(messageId: string): Promise<ReactionMessage[]> {
    const reactionMessageEntities = await this.repository.find({
      where: { message_id: messageId },
      relations: ['message', 'targetMessage'],
      order: { message: { created_at: 'DESC' } },
    });

    return reactionMessageEntities.map((entity) => this.toDomain(entity));
  }

  async getByTargetMessageId(targetMessageId: string): Promise<ReactionMessage[]> {
    const reactionMessageEntities = await this.repository.find({
      where: { target_msg_id: targetMessageId },
      relations: ['message', 'targetMessage'],
      order: { message: { created_at: 'DESC' } },
    });

    return reactionMessageEntities.map((entity) => this.toDomain(entity));
  }

  async getBySessionId(sessionId: string): Promise<ReactionMessage[]> {
    const reactionMessageEntities = await this.repository.find({
      where: { message: { session_id: sessionId } },
      relations: ['message', 'targetMessage'],
      order: { message: { created_at: 'DESC' } },
    });

    return reactionMessageEntities.map((entity) => this.toDomain(entity));
  }

  async getByEmoji(emoji: string): Promise<ReactionMessage[]> {
    const reactionMessageEntities = await this.repository.find({
      where: { emoji },
      relations: ['message', 'targetMessage'],
      order: { message: { created_at: 'DESC' } },
    });

    return reactionMessageEntities.map((entity) => this.toDomain(entity));
  }

  async update(reactionMessage: ReactionMessage): Promise<void> {
    const reactionMessageEntity = this.toEntity(reactionMessage);
    await this.repository.update(reactionMessage.id.value, reactionMessageEntity);
  }

  async delete(id: ReactionMessageId): Promise<void> {
    await this.repository.delete(id.value);
  }

  async deleteByMessageId(messageId: string): Promise<void> {
    await this.repository.delete({ message_id: messageId });
  }

  private toEntity(reactionMessage: ReactionMessage): TypeOrmReactionMessagesEntity {
    const entity = new TypeOrmReactionMessagesEntity();
    entity.id = reactionMessage.id.value;
    entity.message_id = reactionMessage.message_id.value;
    entity.emoji = reactionMessage.emoji.value;
    entity.target_msg_id = reactionMessage.target_msg_id.value;
    return entity;
  }

  private toDomain(entity: TypeOrmReactionMessagesEntity): ReactionMessage {
    return new ReactionMessage(
      new ReactionMessageId(entity.id),
      new ReactionMessageMessageId(entity.message_id),
      new ReactionMessageEmoji(entity.emoji),
      new ReactionMessageTargetMsgId(entity.target_msg_id),
    );
  }
}