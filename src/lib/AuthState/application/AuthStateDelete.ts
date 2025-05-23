import { AuthStateSessionKey } from '../domain/AuthStateSessionKey';
import { AuthStateRepository } from '../domain/MessageRepository';

export class AuthStateDelete {
  constructor(private readonly repository: AuthStateRepository) {}

  async run(sessionKey: string): Promise<void> {
    await this.repository.delete(new AuthStateSessionKey(sessionKey));
  }
}
