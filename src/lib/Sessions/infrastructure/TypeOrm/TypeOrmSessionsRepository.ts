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

@Injectable()
export class TypeOrmSessionsRepository implements SessionsRepository {
  constructor(
    @InjectRepository(TypeOrmSessionsEntity)
    private readonly repository: Repository<TypeOrmSessionsEntity>,
  ) {}

  private mapToDomain(entity: TypeOrmSessionsEntity): Session {
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
      session_name: session.session_name.value,
      phone: session.phone.value,
      status: session.status.value,
      createdAt: session.created_at.value,
      updatedAt: session.updated_at.value,
      is_deleted: session.is_deleted.value,
    });
  }

  async getAll(): Promise<Session[]> {
    const entities = await this.repository.find();
    return entities.map((entity) => this.mapToDomain(entity));
  }

  getOneById(id: SessionId): Promise<Session | null> {
    return this.repository
      .findOne({ where: { id: id.value } })
      .then((entity) => {
        if (!entity) {
          return null;
        }
        return this.mapToDomain(entity);
      });
  }
  getOneByPhone(phone: SessionPhone): Promise<Session | null> {
    return this.repository
      .findOne({ where: { phone: phone.value } })
      .then((entity) => {
        if (!entity) {
          return null;
        }
        return this.mapToDomain(entity);
      });
  }
  getByStatus(status: SessionStatus): Promise<Session[]> {
    return this.repository
      .find({ where: { status: status.value } })
      .then((entities) => {
        return entities.map((entity) => this.mapToDomain(entity));
      });
  }
  update(session: Session): Promise<Session> {
    return this.repository
      .save({
        id: session.id.value,
        session_name: session.session_name.value,
        phone: session.phone.value,
        status: session.status.value,
        createdAt: session.created_at.value,
        updatedAt: session.updated_at.value,
        is_deleted: session.is_deleted.value,
      })
      .then((entity) => this.mapToDomain(entity));
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
