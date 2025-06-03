import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SessionMediaRepository } from '../../domain/SessionMediaRepository';
import { SessionMedia } from '../../domain/SessionMedia';
import { SessionMediaId } from '../../domain/SessionMediaId';
import { SessionMediaSessionId } from '../../domain/SessionMediaSessionId';
import { TypeOrmSessionMediaEntity } from './TypeOrmSessionMediaEntity';

@Injectable()
export class TypeOrmSessionMediaRepository implements SessionMediaRepository {
  constructor(
    @InjectRepository(TypeOrmSessionMediaEntity)
    private readonly repository: Repository<TypeOrmSessionMediaEntity>,
  ) {}

  async create(sessionMedia: SessionMedia): Promise<SessionMedia> {
    const entity = this.toEntity(sessionMedia);
    const savedEntity = await this.repository.save(entity);
    return this.toDomain(savedEntity);
  }

  async findById(id: SessionMediaId): Promise<SessionMedia | null> {
    const entity = await this.repository.findOne({ where: { id: id.toString() } });
    return entity ? this.toDomain(entity) : null;
  }

  async findBySessionId(sessionId: SessionMediaSessionId): Promise<SessionMedia[]> {
    const entities = await this.repository.find({
      where: { sessionId: sessionId.toString() },
      order: { createdAt: 'DESC' },
    });
    return entities.map((entity) => this.toDomain(entity));
  }

  async findAll(): Promise<SessionMedia[]> {
    const entities = await this.repository.find({
      order: { createdAt: 'DESC' },
    });
    return entities.map((entity) => this.toDomain(entity));
  }

  async update(sessionMedia: SessionMedia): Promise<SessionMedia> {
    const entity = this.toEntity(sessionMedia);
    const savedEntity = await this.repository.save(entity);
    return this.toDomain(savedEntity);
  }

  async delete(id: SessionMediaId): Promise<void> {
    await this.repository.delete(id.toString());
  }

  private toDomain(entity: TypeOrmSessionMediaEntity): SessionMedia {
    return SessionMedia.create(
      entity.id,
      entity.sessionId,
      entity.s3Url,
      entity.fileName,
      entity.mediaType,
      entity.description,
      entity.createdAt,
    );
  }

  private toEntity(sessionMedia: SessionMedia): TypeOrmSessionMediaEntity {
    const entity = new TypeOrmSessionMediaEntity();
    entity.id = sessionMedia.getId().toString();
    entity.sessionId = sessionMedia.getSessionId().toString();
    entity.s3Url = sessionMedia.getS3Url().toString();
    entity.fileName = sessionMedia.getFileName().toString();
    entity.mediaType = sessionMedia.getMediaType().toString();
    entity.description = sessionMedia.getDescription().toString();
    entity.createdAt = sessionMedia.getCreatedAt().toDate();
    return entity;
  }
}