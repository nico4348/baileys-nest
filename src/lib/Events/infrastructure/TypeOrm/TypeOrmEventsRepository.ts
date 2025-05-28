import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TypeOrmEventsEntity } from './TypeOrmEventsEntity';
import { EventRepository } from '../../domain/EventRepository';
import { Event } from '../../domain/Event';
import { EventId } from '../../domain/EventId';
import { EventName } from '../../domain/EventName';
import { EventDescription } from '../../domain/EventDescription';
import { EventCreatedAt } from '../../domain/EventCreatedAt';

@Injectable()
export class TypeOrmEventsRepository implements EventRepository {
  constructor(
    @InjectRepository(TypeOrmEventsEntity)
    private readonly repository: Repository<TypeOrmEventsEntity>,
  ) {}

  async save(event: Event): Promise<void> {
    const eventEntity = this.toEntity(event);
    await this.repository.save(eventEntity);
  }

  async findById(id: EventId): Promise<Event | null> {
    const eventEntity = await this.repository.findOne({
      where: { id: id.value },
    });

    if (!eventEntity) {
      return null;
    }

    return this.toDomain(eventEntity);
  }

  async findByName(name: EventName): Promise<Event | null> {
    const eventEntity = await this.repository.findOne({
      where: { event_name: name.value },
    });

    if (!eventEntity) {
      return null;
    }

    return this.toDomain(eventEntity);
  }

  async findAll(): Promise<Event[]> {
    const eventEntities = await this.repository.find({
      order: { created_at: 'DESC' },
    });

    return eventEntities.map((entity) => this.toDomain(entity));
  }

  async delete(id: EventId): Promise<void> {
    await this.repository.delete(id.value);
  }

  async update(event: Event): Promise<void> {
    const eventEntity = this.toEntity(event);
    await this.repository.update(event.id.value, eventEntity);
  }

  private toEntity(event: Event): TypeOrmEventsEntity {
    const entity = new TypeOrmEventsEntity();
    entity.id = event.id.value;
    entity.event_name = event.event_name.value;
    entity.description = event.description.value;
    entity.created_at = event.created_at.value;
    return entity;
  }

  private toDomain(entity: TypeOrmEventsEntity): Event {
    return new Event(
      new EventId(entity.id),
      new EventName(entity.event_name),
      new EventDescription(entity.description),
      new EventCreatedAt(entity.created_at),
    );
  }
}