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
import { SessionDeletedAt } from '../../domain/SessionDeletedAt';
import { SessionRateLimit } from '../../domain/SessionRateLimit';
import { SessionRateLimitWindow } from '../../domain/SessionRateLimitWindow';

@Injectable()
export class TypeOrmSessionsRepository implements SessionsRepository {
  constructor(
    @InjectRepository(TypeOrmSessionsEntity)
    private readonly repository: Repository<TypeOrmSessionsEntity>,
  ) {}

  private mapToDomain(entity: TypeOrmSessionsEntity): Session {
    try {
      return new Session(
        new SessionId(entity.id),
        new SessionName(entity.session_name),
        new SessionPhone(entity.phone),
        new SessionStatus(entity.status),
        new SessionCreatedAt(entity.created_at),
        new SessionUpdatedAt(entity.updated_at),
        new SessionIsDeleted(entity.is_deleted),
        new SessionDeletedAt(entity.deleted_at),
        new SessionRateLimit(entity.rate_limit),
        new SessionRateLimitWindow(entity.rate_limit_window),
      );
    } catch (error) {
      throw new Error(
        `Failed to map entity to domain object: ${error.message}`,
      );
    }
  }

  private mapToEntity(session: Session): Partial<TypeOrmSessionsEntity> {
    return {
      id: session.id.value,
      session_name: session.sessionName.value,
      phone: session.phone.value,
      status: session.status.value,
      created_at: session.createdAt.value,
      updated_at: session.updatedAt.value,
      is_deleted: session.isDeleted.value,
      deleted_at: session.deletedAt.value,
      rate_limit: session.rateLimit.getValue(),
      rate_limit_window: session.rateLimitWindow.getValue(),
    };
  }
  async create(session: Session): Promise<void> {
    try {
      const entity = this.mapToEntity(session);
      await this.repository.save(entity);
    } catch (error) {
      throw new Error(`Failed to create session: ${error.message}`);
    }
  }

  async getAll(): Promise<Session[]> {
    try {
      const entities = await this.repository.find({
        order: { created_at: 'DESC' },
      });
      return entities.map((entity) => this.mapToDomain(entity));
    } catch (error) {
      throw new Error(`Failed to get all sessions: ${error.message}`);
    }
  }

  async getOneById(id: SessionId): Promise<Session | null> {
    try {
      const entity = await this.repository.findOne({
        where: { id: id.value },
      });

      if (!entity) {
        return null;
      }

      return this.mapToDomain(entity);
    } catch (error) {
      throw new Error(`Failed to get session by id: ${error.message}`);
    }
  }

  async getOneByPhone(phone: SessionPhone): Promise<Session | null> {
    try {
      const entity = await this.repository.findOne({
        where: { phone: phone.value },
      });

      if (!entity) {
        return null;
      }

      return this.mapToDomain(entity);
    } catch (error) {
      throw new Error(`Failed to get session by phone: ${error.message}`);
    }
  }

  async getByPhone(
    phone: SessionPhone,
    limit?: number,
    offset?: number,
  ): Promise<Session[]> {
    try {
      const entities = await this.repository.find({
        where: { phone: phone.value },
        order: { created_at: 'DESC' },
        take: limit,
        skip: offset,
      });
      return entities.map((entity) => this.mapToDomain(entity));
    } catch (error) {
      throw new Error(`Failed to get sessions by phone: ${error.message}`);
    }
  }

  async getByStatus(
    status: SessionStatus,
    limit?: number,
    offset?: number,
  ): Promise<Session[]> {
    try {
      const entities = await this.repository.find({
        where: { status: status.value },
        order: { created_at: 'DESC' },
        take: limit,
        skip: offset,
      });
      return entities.map((entity) => this.mapToDomain(entity));
    } catch (error) {
      throw new Error(`Failed to get sessions by status: ${error.message}`);
    }
  }

  async getByIsDeleted(
    isDeleted: SessionIsDeleted,
    limit?: number,
    offset?: number,
  ): Promise<Session[]> {
    try {
      const entities = await this.repository.find({
        where: { is_deleted: isDeleted.value },
        order: { created_at: 'DESC' },
        take: limit,
        skip: offset,
      });
      return entities.map((entity) => this.mapToDomain(entity));
    } catch (error) {
      throw new Error(`Failed to get sessions by is_deleted: ${error.message}`);
    }
  }

  async getByCreatedAtRange(
    startDate: Date,
    endDate: Date,
    limit?: number,
    offset?: number,
  ): Promise<Session[]> {
    try {
      const entities = await this.repository
        .createQueryBuilder('session')
        .where('session.created_at >= :startDate', { startDate })
        .andWhere('session.created_at <= :endDate', { endDate })
        .orderBy('session.created_at', 'DESC')
        .take(limit)
        .skip(offset)
        .getMany();

      return entities.map((entity) => this.mapToDomain(entity));
    } catch (error) {
      throw new Error(
        `Failed to get sessions by created_at range: ${error.message}`,
      );
    }
  }

  async getByUpdatedAtRange(
    startDate: Date,
    endDate: Date,
    limit?: number,
    offset?: number,
  ): Promise<Session[]> {
    try {
      const entities = await this.repository
        .createQueryBuilder('session')
        .where('session.updated_at >= :startDate', { startDate })
        .andWhere('session.updated_at <= :endDate', { endDate })
        .orderBy('session.updated_at', 'DESC')
        .take(limit)
        .skip(offset)
        .getMany();

      return entities.map((entity) => this.mapToDomain(entity));
    } catch (error) {
      throw new Error(
        `Failed to get sessions by updated_at range: ${error.message}`,
      );
    }
  }

  async update(session: Session): Promise<Session> {
    try {
      const entity = this.mapToEntity(session);
      const savedEntity = await this.repository.save(entity);
      return this.mapToDomain(savedEntity as TypeOrmSessionsEntity);
    } catch (error) {
      throw new Error(`Failed to update session: ${error.message}`);
    }
  }

  async hardDelete(id: SessionId): Promise<void> {
    try {
      const result = await this.repository.delete({ id: id.value });

      if (result.affected === 0) {
        throw new Error(`Session with id ${id.value} not found`);
      }
    } catch (error) {
      throw new Error(`Failed to hard delete session: ${error.message}`);
    }
  }

  async softDelete(id: SessionId, deletedAt: SessionDeletedAt): Promise<void> {
    try {
      const result = await this.repository.update(
        { id: id.value },
        {
          is_deleted: true,
          status: false,
          deleted_at: deletedAt.value,
        },
      );

      if (result.affected === 0) {
        throw new Error(`Session with id ${id.value} not found`);
      }
    } catch (error) {
      throw new Error(`Failed to soft delete session: ${error.message}`);
    }
  }
}
