import { SessionLog } from '../domain/SessionLog';
import { SessionLogRepository } from '../domain/SessionLogRepository';

export class SessionLogGetAll {
  constructor(private readonly repository: SessionLogRepository) {}

  async run(): Promise<SessionLog[]> {
    return this.repository.getAll();
  }
}
