import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { SessionLogRepository } from '../../domain/SessionLogRepository';
import { SessionLog } from '../../domain/SessionLog';
import { SessionLogId } from '../../domain/SessionLogId';
import { SessionLogSessionId } from '../../domain/SessionLogSessionId';
import { SessionLogLogType } from '../../domain/SessionLogLogType';
import { SessionLogMessage } from '../../domain/SessionLogMessage';
import { SessionLogCreatedAt } from '../../domain/SessionLogCreatedAt';
import { TypeOrmSessionLogsEntity } from './TypeOrmSessionLogsEntity';

@Injectable()
export class TypeOrmSessionLogsRepository implements SessionLogRepository {
  constructor(
    @InjectRepository(TypeOrmSessionLogsEntity)
    private readonly repository: Repository<TypeOrmSessionLogsEntity>,
  ) {}
  private mapToDomain(entity: TypeOrmSessionLogsEntity): SessionLog {
    try {
      return new SessionLog(
        new SessionLogId(entity.id),
        new SessionLogSessionId(entity.session_id),
        new SessionLogLogType(entity.log_type),
        new SessionLogMessage(entity.message),
        new SessionLogCreatedAt(entity.created_at),
      );
    } catch (error) {
      throw new Error(
        `Failed to map entity to domain object: ${error.message}`,
      );
    }
  }

  private mapToEntity(
    sessionLog: SessionLog,
  ): Partial<TypeOrmSessionLogsEntity> {
    return {
      id: sessionLog.id.value,
      session_id: sessionLog.sessionId.value,
      log_type: sessionLog.logType.value,
      message: sessionLog.message.value,
      created_at: sessionLog.createdAt.value,
    };
  }

  async create(sessionLog: SessionLog): Promise<SessionLog> {
    try {
      const entity = this.mapToEntity(sessionLog);
      const savedEntity = await this.repository.save(entity);
      return this.mapToDomain(savedEntity as TypeOrmSessionLogsEntity);
    } catch (error) {
      throw new Error(`Failed to create session log: ${error.message}`);
    }
  }

  async getAll(): Promise<SessionLog[]> {
    try {
      const entities = await this.repository.find({
        order: { created_at: 'DESC' },
        take: 1000, // Limit to avoid performance issues
      });
      return entities.map((entity) => this.mapToDomain(entity));
    } catch (error) {
      throw new Error(`Failed to get all session logs: ${error.message}`);
    }
  }

  async getOneById(id: SessionLogId): Promise<SessionLog | null> {
    try {
      const entity = await this.repository.findOne({
        where: { id: id.value },
      });

      if (!entity) {
        return null;
      }

      return this.mapToDomain(entity);
    } catch (error) {
      throw new Error(`Failed to get session log by id: ${error.message}`);
    }
  }

  async getBySessionId(sessionId: SessionLogSessionId): Promise<SessionLog[]> {
    try {
      const entities = await this.repository.find({
        where: { session_id: sessionId.value },
        order: { created_at: 'DESC' },
        take: 500, // Limit logs per session
      });
      return entities.map((entity) => this.mapToDomain(entity));
    } catch (error) {
      throw new Error(
        `Failed to get session logs by session id: ${error.message}`,
      );
    }
  }

  async getBySessionIdAndType(
    sessionId: SessionLogSessionId,
    logType: SessionLogLogType,
  ): Promise<SessionLog[]> {
    try {
      const entities = await this.repository.find({
        where: {
          session_id: sessionId.value,
          log_type: logType.value,
        },
        order: { created_at: 'DESC' },
        take: 100,
      });
      return entities.map((entity) => this.mapToDomain(entity));
    } catch (error) {
      throw new Error(
        `Failed to get session logs by session id and type: ${error.message}`,
      );
    }
  }

  async getRecent(limit: number = 100): Promise<SessionLog[]> {
    try {
      const entities = await this.repository.find({
        order: { created_at: 'DESC' },
        take: limit,
      });
      return entities.map((entity) => this.mapToDomain(entity));
    } catch (error) {
      throw new Error(`Failed to get recent session logs: ${error.message}`);
    }
  }

  async update(sessionLog: SessionLog): Promise<SessionLog> {
    try {
      const entity = this.mapToEntity(sessionLog);
      const savedEntity = await this.repository.save(entity);
      return this.mapToDomain(savedEntity as TypeOrmSessionLogsEntity);
    } catch (error) {
      throw new Error(`Failed to update session log: ${error.message}`);
    }
  }

  async delete(id: SessionLogId): Promise<void> {
    try {
      const result = await this.repository.delete({ id: id.value });

      if (result.affected === 0) {
        throw new Error(`Session log with id ${id.value} not found`);
      }
    } catch (error) {
      throw new Error(`Failed to delete session log: ${error.message}`);
    }
  }

  async deleteBySessionId(sessionId: SessionLogSessionId): Promise<void> {
    try {
      await this.repository.delete({ session_id: sessionId.value });
    } catch (error) {
      throw new Error(
        `Failed to delete session logs by session id: ${error.message}`,
      );
    }
  }

  async deleteOldLogs(olderThanDays: number): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

      const result = await this.repository
        .createQueryBuilder()
        .delete()
        .where('created_at < :cutoffDate', { cutoffDate })
        .execute();

      return result.affected || 0;
    } catch (error) {
      throw new Error(`Failed to delete old session logs: ${error.message}`);
    }
  }
}
