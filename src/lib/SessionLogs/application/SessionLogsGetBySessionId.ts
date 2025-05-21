import { SessionLog } from '../domain/SessionLog';
import { SessionLogRepository } from '../domain/SessionLogRepository';
import { SessionLogSessionId } from '../domain/SessionLogSessionId';

export class SessionLogGetBySessionId {
  constructor(private readonly repository: SessionLogRepository) {}

  async run(id: string): Promise<SessionLog[] | null> {
    return this.repository.getBySessionId(new SessionLogSessionId(id));
  }
}
