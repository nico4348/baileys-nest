import { Injectable } from '@nestjs/common';
import { SessionsRepository } from '../../domain/SessionsRepository';
import { TypeOrmSessionsEntity } from './TypeOrmSessionsEntity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Session } from '../../domain/Session';
import { SessionId } from '../../domain/SessionId';
import { SessionPhone } from '../../domain/SessionPhone';
import { SessionStatus } from '../../domain/SessionStatus';
import { SessionName } from '../../domain/SessionName';
import { SessionCreatedAt } from '../../domain/SessionCreatedAt';
import { SessionUpdatedAt } from '../../domain/SessionUpdatedAt';
import { SessionIsDeleted } from '../../domain/SessionIsDeleted';

export class TypeOrmSessionsRepository implements SessionsRepository {
  constructor(
    @InjectRepository(TypeOrmSessionsEntity)
    private readonly repository: Repository<TypeOrmSessionsEntity>,
  ) {}

  private mapToDomain(entity: TypeOrmSessionsEntity) {
    return new Session(
      new SessionId(entity.id),
      new SessionName(entity.session_name),
      new SessionPhone(entity.phone),
      new SessionStatus(entity.status),
      new SessionCreatedAt(entity.created_at),
      new SessionUpdatedAt(entity.updated_at),
      new SessionIsDeleted(entity.is_deleted),
    );
  }

  async create(session: Session): Promise<void> {
    await this.repository.save({
      id: session.id.value,
      session_name: session.sessionName.value,
      phone: session.phone.value,
      status: session.status.value,
      created_at: session.createdAt.value,
      updated_at: session.updatedAt.value,
      is_deleted: session.isDeleted.value,
    });
  }

  async getAll(): Promise<Session[]> {
    const entities = await this.repository.find();
    return entities.map((entity) => this.mapToDomain(entity));
  }

  async getOneById(id: SessionId): Promise<Session | null> {
    const entity = await this.repository.findOne({ where: { id: id.value } });
    if (!entity) {
      return null;
    }
    return this.mapToDomain(entity);
  }
  async getOneByPhone(phone: SessionPhone): Promise<Session | null> {
    const entity = await this.repository.findOne({
      where: { phone: phone.value },
    });
    if (!entity) {
      return null;
    }
    return this.mapToDomain(entity);
  }
  async getByStatus(status: SessionStatus): Promise<Session[]> {
    const entities = await this.repository.find({
      where: { status: status.value },
    });
    return entities.map((entity) => this.mapToDomain(entity));
  }
  async update(session: Session): Promise<Session> {
    const entity_1 = await this.repository.save({
      id: session.id.value,
      session_name: session.sessionName.value,
      phone: session.phone.value,
      status: session.status.value,
      created_at: session.createdAt.value,
      updated_at: session.updatedAt.value,
      is_deleted: session.isDeleted.value,
    });
    return this.mapToDomain(entity_1);
  }
  async delete(id: SessionId): Promise<void> {
    await this.repository.delete({ id: id.value });
  }
  async hardDelete(id: SessionId): Promise<void> {
    await this.repository.delete({ id: id.value });
  }
  async softDelete(id: SessionId): Promise<void> {
    await this.repository.update({ id: id.value }, { is_deleted: true });
  }
}
