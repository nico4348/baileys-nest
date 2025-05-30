import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StatusRepository } from '../../domain/StatusRepository';
import { Status } from '../../domain/Status';
import { StatusId } from '../../domain/StatusId';
import { StatusName } from '../../domain/StatusName';
import { TypeOrmStatusEntity } from './TypeOrmStatusEntity';
import { StatusCreatedAt } from '../../domain/StatusCreatedAt';
import { StatusDescription } from '../../domain/StatusDescription';

@Injectable()
export class TypeOrmStatusRepository implements StatusRepository {
  constructor(
    @InjectRepository(TypeOrmStatusEntity)
    private readonly statusRepository: Repository<TypeOrmStatusEntity>,
  ) {}

  async save(status: Status): Promise<void> {
    const statusEntity = new TypeOrmStatusEntity();
    statusEntity.id = status.id.value;
    statusEntity.name = status.name.value;
    statusEntity.description = status.description.value;
    statusEntity.created_at = status.created_at.value;

    await this.statusRepository.save(statusEntity);
  }

  async findById(id: StatusId): Promise<Status | null> {
    const statusEntity = await this.statusRepository.findOne({
      where: { id: id.value },
    });

    if (!statusEntity) {
      return null;
    }

    return new Status(
      new StatusId(statusEntity.id),
      new StatusName(statusEntity.name),
      new StatusDescription(statusEntity.description),
      new StatusCreatedAt(statusEntity.created_at),
    );
  }

  async findByName(name: StatusName): Promise<Status | null> {
    const statusEntity = await this.statusRepository.findOne({
      where: { name: name.value },
    });

    if (!statusEntity) {
      return null;
    }

    return new Status(
      new StatusId(statusEntity.id),
      new StatusName(statusEntity.name),
      new StatusDescription(statusEntity.description),
      new StatusCreatedAt(statusEntity.created_at),
    );
  }

  async findAll(): Promise<Status[]> {
    const statusEntities = await this.statusRepository.find();

    return statusEntities.map(
      (statusEntity) =>
        new Status(
          new StatusId(statusEntity.id),
          new StatusName(statusEntity.name),
          new StatusDescription(statusEntity.description),
          new StatusCreatedAt(statusEntity.created_at),
        ),
    );
  }

  async delete(id: StatusId): Promise<void> {
    await this.statusRepository.delete({ id: id.value });
  }

  async update(status: Status): Promise<void> {
    await this.statusRepository.update(
      { id: status.id.value },
      {
        name: status.name.value,
        description: status.description.value,
      },
    );
  }
}