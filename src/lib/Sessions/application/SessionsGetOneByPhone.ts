import { Session } from '../domain/Session';
import { SessionPhone } from '../domain/SessionPhone';
import { SessionsRepository } from '../domain/SessionsRepository';

export class SessionsGetOneById {
  constructor(private readonly repository: SessionsRepository) {}

  async run(phone: string): Promise<Session | null> {
    return this.repository.getOneByPhone(new SessionPhone(phone));
  }
}
