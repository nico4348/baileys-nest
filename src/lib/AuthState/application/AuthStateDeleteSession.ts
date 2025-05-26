import { AuthStateRepository } from '../domain/AuthStateRepository';

export class AuthStateDeleteSession {
  constructor(private readonly authStateRepository: AuthStateRepository) {}
  async run(sessionId: string): Promise<void> {
    try {
      await this.authStateRepository.deleteByKeyPattern(`${sessionId}:%`);
    } catch (error) {
      throw error;
    }
  }
}
