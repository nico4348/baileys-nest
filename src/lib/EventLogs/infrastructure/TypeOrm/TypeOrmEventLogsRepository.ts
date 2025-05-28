import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TypeOrmEventLogsEntity } from './TypeOrmEventLogsEntity';
import { EventLogRepository } from '../../domain/EventLogRepository';
import { EventLog } from '../../domain/EventLog';
import { EventLogId } from '../../domain/EventLogId';
import { EventLogSessionId } from '../../domain/EventLogSessionId';
import { EventLogEventId } from '../../domain/EventLogEventId';
import { EventLogCreatedAt } from '../../domain/EventLogCreatedAt';

@Injectable()
export class TypeOrmEventLogsRepository implements EventLogRepository {
  constructor(
    @InjectRepository(TypeOrmEventLogsEntity)
    private readonly repository: Repository<TypeOrmEventLogsEntity>,
  ) {}

  async save(eventLog: EventLog): Promise<void> {
    const eventLogEntity = this.toEntity(eventLog);
    await this.repository.save(eventLogEntity);
  }

  async findById(id: EventLogId): Promise<EventLog | null> {
    const eventLogEntity = await this.repository.findOne({
      where: { id: id.value },
      relations: ['session', 'event'],
    });

    if (!eventLogEntity) {
      return null;
    }

    return this.toDomain(eventLogEntity);
  }

  async findBySessionId(sessionId: EventLogSessionId): Promise<EventLog[]> {
    const eventLogEntities = await this.repository.find({
      where: { session_id: sessionId.value },
      relations: ['session', 'event'],
      order: { created_at: 'DESC' },
    });

    return eventLogEntities.map((entity) => this.toDomain(entity));
  }

  async findByEventId(eventId: EventLogEventId): Promise<EventLog[]> {
    const eventLogEntities = await this.repository.find({
      where: { event_id: eventId.value },
      relations: ['session', 'event'],
      order: { created_at: 'DESC' },
    });

    return eventLogEntities.map((entity) => this.toDomain(entity));
  }

  async findAll(): Promise<EventLog[]> {
    const eventLogEntities = await this.repository.find({
      relations: ['session', 'event'],
      order: { created_at: 'DESC' },
    });

    return eventLogEntities.map((entity) => this.toDomain(entity));
  }

  async delete(id: EventLogId): Promise<void> {
    await this.repository.delete(id.value);
  }

  async deleteBySessionId(sessionId: EventLogSessionId): Promise<void> {
    await this.repository.delete({ session_id: sessionId.value });
  }

  async update(eventLog: EventLog): Promise<void> {
    const eventLogEntity = this.toEntity(eventLog);
    await this.repository.update(eventLog.id.value, eventLogEntity);
  }

  private toEntity(eventLog: EventLog): TypeOrmEventLogsEntity {
    const entity = new TypeOrmEventLogsEntity();
    entity.id = eventLog.id.value;
    entity.session_id = eventLog.session_id.value;
    entity.event_id = eventLog.event_id.value;
    entity.created_at = eventLog.created_at.value;
    return entity;
  }

  private toDomain(entity: TypeOrmEventLogsEntity): EventLog {
    return new EventLog(
      new EventLogId(entity.id),
      new EventLogSessionId(entity.session_id),
      new EventLogEventId(entity.event_id),
      new EventLogCreatedAt(entity.created_at),
    );
  }
}