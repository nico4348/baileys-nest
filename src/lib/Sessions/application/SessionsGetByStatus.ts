import { Session } from '../domain/Session';
import { SessionsRepository } from '../domain/SessionsRepository';
import { SessionStatus } from '../domain/SessionStatus';

export class SessionsGetByStatus {
  constructor(private readonly repository: SessionsRepository) {}

  async run(
    status: boolean,
    limit?: number,
    offset?: number,
  ): Promise<Session[]> {
    return this.repository.getByStatus(
      new SessionStatus(status),
      limit,
      offset,
    );
  }
}
