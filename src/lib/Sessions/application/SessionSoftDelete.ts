import { SessionId } from '../domain/SessionId';
import { SessionsRepository } from '../domain/SessionsRepository';

export class SessionSoftDelete {
  constructor(private readonly repository: SessionsRepository) {}

  async run(id: string): Promise<void> {
    return this.repository.softDelete(new SessionId(id));
  }
}
