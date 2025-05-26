import { AuthState } from '../domain/AuthState';
import { AuthStateRepository } from '../domain/AuthStateRepository';

export class AuthStateGetAll {
  constructor(private readonly repository: AuthStateRepository) {}

  async run(): Promise<AuthState[]> {
    return await this.repository.getAll();
  }
}
