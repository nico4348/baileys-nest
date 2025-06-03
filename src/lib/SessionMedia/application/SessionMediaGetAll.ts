import { Injectable, Inject } from '@nestjs/common';
import { SessionMediaRepository } from '../domain/SessionMediaRepository';
import { SessionMedia } from '../domain/SessionMedia';

@Injectable()
export class SessionMediaGetAll {
  constructor(@Inject('SessionMediaRepository') private readonly repository: SessionMediaRepository) {}

  async execute(): Promise<SessionMedia[]> {
    return await this.repository.findAll();
  }
}