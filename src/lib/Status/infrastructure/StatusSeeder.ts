import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TypeOrmStatusEntity } from './TypeOrm/TypeOrmStatusEntity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class StatusSeeder {
  constructor(
    @InjectRepository(TypeOrmStatusEntity)
    private readonly statusRepository: Repository<TypeOrmStatusEntity>,
  ) {}

  async seed(): Promise<void> {
    const statuses = [
      {
        id: uuidv4(),
        name: 'pending',
        description: 'Mensaje pendiente de envío',
      },
      {
        id: uuidv4(),
        name: 'sent',
        description: 'Mensaje enviado',
      },
      {
        id: uuidv4(),
        name: 'delivered',
        description: 'Mensaje entregado',
      },
      {
        id: uuidv4(),
        name: 'read',
        description: 'Mensaje leído',
      },
      {
        id: uuidv4(),
        name: 'played',
        description: 'Mensaje de audio reproducido',
      },
      {
        id: uuidv4(),
        name: 'failed',
        description: 'Mensaje falló al enviar',
      },
    ];

    for (const statusData of statuses) {
      const existingStatus = await this.statusRepository.findOne({
        where: { name: statusData.name },
      });

      if (!existingStatus) {
        const status = new TypeOrmStatusEntity();
        status.id = statusData.id;
        status.name = statusData.name;
        status.description = statusData.description;
        status.created_at = new Date();

        await this.statusRepository.save(status);
      }
    }
  }
}