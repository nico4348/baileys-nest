import { Injectable, Inject } from '@nestjs/common';
import { SessionLog } from '../domain/SessionLog';
import { SessionLogRepository } from '../domain/SessionLogRepository';

@Injectable()
export class SessionLogsGetAll {
  constructor(
    @Inject('SessionLogRepository')
    private readonly repository: SessionLogRepository,
  ) {}

  async run(): Promise<SessionLog[]> {
    return this.repository.getAll();
  }
}
