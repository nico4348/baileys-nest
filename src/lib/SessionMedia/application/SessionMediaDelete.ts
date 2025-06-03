import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { SessionMediaRepository } from '../domain/SessionMediaRepository';
import { SessionMediaId } from '../domain/SessionMediaId';

@Injectable()
export class SessionMediaDelete {
  constructor(@Inject('SessionMediaRepository') private readonly repository: SessionMediaRepository) {}

  async execute(id: string): Promise<void> {
    const sessionMediaId = new SessionMediaId(id);
    const sessionMedia = await this.repository.findById(sessionMediaId);
    
    if (!sessionMedia) {
      throw new NotFoundException(`SessionMedia with id ${id} not found`);
    }

    await this.repository.delete(sessionMediaId);
  }
}