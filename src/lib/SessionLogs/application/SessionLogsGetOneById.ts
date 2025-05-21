import { SessionLog } from '../domain/SessionLog';
import { SessionLogId } from '../domain/SessionLogId';
import { SessionLogRepository } from '../domain/SessionLogRepository';

export class SessionLogGetOneById {
  constructor(private readonly repository: SessionLogRepository) {}

  async run(id: string): Promise<SessionLog | null> {
    return this.repository.getOneById(new SessionLogId(id));
  }
}
