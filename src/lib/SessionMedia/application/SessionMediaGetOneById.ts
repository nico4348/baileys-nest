import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { SessionMediaRepository } from '../domain/SessionMediaRepository';
import { SessionMedia } from '../domain/SessionMedia';
import { SessionMediaId } from '../domain/SessionMediaId';

@Injectable()
export class SessionMediaGetOneById {
  constructor(@Inject('SessionMediaRepository') private readonly repository: SessionMediaRepository) {}

  async execute(id: string): Promise<SessionMedia> {
    const sessionMediaId = new SessionMediaId(id);
    const sessionMedia = await this.repository.findById(sessionMediaId);
    
    if (!sessionMedia) {
      throw new NotFoundException(`SessionMedia with id ${id} not found`);
    }

    return sessionMedia;
  }
}