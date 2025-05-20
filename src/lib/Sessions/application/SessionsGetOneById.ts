import { Session } from '../domain/Session';
import { SessionId } from '../domain/SessionId';
import { SessionsRepository } from '../domain/SessionsRepository';

export class SessionsGetOneById {
  constructor(private readonly repository: SessionsRepository) {}

  async getOneById(id: string): Promise<Session | null> {
    return this.repository.getOneById(new SessionId(id));
  }
}
