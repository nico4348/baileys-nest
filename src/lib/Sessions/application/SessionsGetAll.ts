import { Session } from '../domain/Session';
import { SessionsRepository } from '../domain/SessionsRepository';

export class SessionsGetAll {
  constructor(private readonly repository: SessionsRepository) {}

  async getAll(): Promise<Session[]> {
    return this.repository.getAll();
  }
}
