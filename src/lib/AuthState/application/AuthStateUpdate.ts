import { AuthState } from '../domain/AuthState';
import { AuthStateRepository } from '../domain/MessageRepository';

export class AuthStateUpdate {
  constructor(private readonly repository: AuthStateRepository) {}

  async run(authState: AuthState): Promise<AuthState> {
    return await this.repository.update(authState);
  }
}
