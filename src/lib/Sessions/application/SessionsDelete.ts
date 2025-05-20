import { SessionId } from '../domain/SessionId';
import { SessionsRepository } from '../domain/SessionsRepository';

export class SessionsDelete {
  constructor(private readonly repository: SessionsRepository) {}

  async run(id: string): Promise<void> {
    return this.repository.delete(new SessionId(id));
  }
}
