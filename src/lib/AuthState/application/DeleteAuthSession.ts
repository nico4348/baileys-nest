// Caso de uso para eliminar la sesión
import { AuthDataRepository } from '../domain/AuthDataRepository';

export class DeleteAuthSession {
  constructor(private readonly authDataRepository: AuthDataRepository) {}

  async execute(sessionId: string): Promise<void> {
    await this.authDataRepository.deleteByKeyPattern(`${sessionId}:%`);
  }
}
