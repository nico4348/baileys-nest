import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TypeOrmMediaMessagesEntity } from './TypeOrmMediaMessagesEntity';
import { MediaMessageRepository } from '../../domain/MediaMessageRepository';
import { MediaMessage } from '../../domain/MediaMessage';
import { MediaMessageId } from '../../domain/MediaMessageId';
import { MediaMessageMessageId } from '../../domain/MediaMessageMessageId';
import { MediaMessageCaption } from '../../domain/MediaMessageCaption';
import { MediaMessageMediaType } from '../../domain/MediaMessageMediaType';
import { MediaMessageMimeType } from '../../domain/MediaMessageMimeType';
import { MediaMessageFileName } from '../../domain/MediaMessageFileName';
import { MediaMessageFilePath } from '../../domain/MediaMessageFilePath';

@Injectable()
export class TypeOrmMediaMessagesRepository implements MediaMessageRepository {
  constructor(
    @InjectRepository(TypeOrmMediaMessagesEntity)
    private readonly repository: Repository<TypeOrmMediaMessagesEntity>,
  ) {}

  async create(mediaMessage: MediaMessage): Promise<void> {
    const mediaMessageEntity = this.toEntity(mediaMessage);
    await this.repository.save(mediaMessageEntity);
  }

  async getAll(): Promise<MediaMessage[]> {
    const mediaMessageEntities = await this.repository.find({
      relations: ['message'],
      order: { message: { created_at: 'DESC' } },
    });

    return mediaMessageEntities.map((entity) => this.toDomain(entity));
  }
  async getOneById(id: MediaMessageId): Promise<MediaMessage | null> {
    const mediaMessageEntity = await this.repository.findOne({
      where: { message_id: id.value },
      relations: ['message'],
    });

    if (!mediaMessageEntity) {
      return null;
    }

    return this.toDomain(mediaMessageEntity);
  }

  async getByMessageId(messageId: string): Promise<MediaMessage | null> {
    const mediaMessageEntity = await this.repository.findOne({
      where: { message_id: messageId },
      relations: ['message'],
    });

    if (!mediaMessageEntity) {
      return null;
    }

    return this.toDomain(mediaMessageEntity);
  }

  async getBySessionId(sessionId: string): Promise<MediaMessage[]> {
    const mediaMessageEntities = await this.repository.find({
      where: { message: { session_id: sessionId } },
      relations: ['message'],
      order: { message: { created_at: 'DESC' } },
    });

    return mediaMessageEntities.map((entity) => this.toDomain(entity));
  }

  async getByMediaType(mediaType: string): Promise<MediaMessage[]> {
    const mediaMessageEntities = await this.repository.find({
      where: { media_type: mediaType },
      relations: ['message'],
      order: { message: { created_at: 'DESC' } },
    });

    return mediaMessageEntities.map((entity) => this.toDomain(entity));
  }
  async update(mediaMessage: MediaMessage): Promise<void> {
    const mediaMessageEntity = this.toEntity(mediaMessage);
    await this.repository.update(
      mediaMessage.message_id.value,
      mediaMessageEntity,
    );
  }

  async delete(id: MediaMessageId): Promise<void> {
    await this.repository.delete(id.value);
  }

  async deleteByMessageId(messageId: string): Promise<void> {
    await this.repository.delete({ message_id: messageId });
  }
  private toEntity(mediaMessage: MediaMessage): TypeOrmMediaMessagesEntity {
    const entity = new TypeOrmMediaMessagesEntity();
    entity.message_id = mediaMessage.message_id.value;
    entity.caption = mediaMessage.caption.value;
    entity.media_type = mediaMessage.media_type.value;
    entity.mime_type = mediaMessage.mime_type.value;
    entity.file_name = mediaMessage.file_name.value;
    entity.file_path = mediaMessage.file_path.value;
    return entity;
  }
  private toDomain(entity: TypeOrmMediaMessagesEntity): MediaMessage {
    return new MediaMessage(
      new MediaMessageMessageId(entity.message_id),
      new MediaMessageCaption(entity.caption),
      new MediaMessageMediaType(entity.media_type),
      new MediaMessageMimeType(entity.mime_type),
      new MediaMessageFileName(entity.file_name),
      new MediaMessageFilePath(entity.file_path),
    );
  }
}
