import { AuthState } from '../domain/AuthState';
import { AuthStateSessionKey } from '../domain/AuthStateSessionKey';
import { AuthStateRepository } from '../domain/AuthStateRepository';

export class AuthStateGetOneById {
  constructor(private readonly repository: AuthStateRepository) {}

  async run(sessionKey: string): Promise<AuthState | null> {
    return await this.repository.getOneById(
      new AuthStateSessionKey(sessionKey),
    );
  }
}
