import { SessionLogId } from '../domain/SessionLogId';
import { SessionLogRepository } from '../domain/SessionLogRepository';

export class SessionLogDelete {
  constructor(private readonly repository: SessionLogRepository) {}

  async run(id: string): Promise<void> {
    return this.repository.delete(new SessionLogId(id));
  }
}
