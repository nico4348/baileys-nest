import { AuthState } from '../domain/AuthState';
import { AuthStateSessionKey } from '../domain/AuthStateSessionKey';
import { AuthStateRepository } from '../domain/MessageRepository';
import { AuthStateData } from '../domain/AuthStateData';

export class AuthStateCreate {
  constructor(private readonly repository: AuthStateRepository) {}

  async run(data: Record<string, any>, sessionKey: string): Promise<void> {
    const authState = new AuthState(
      new AuthStateData(data),
      new AuthStateSessionKey(sessionKey),
    );
    await this.repository.create(authState);
  }
}
