// Caso de uso para guardar credenciales
import { AuthDataRepository } from '../domain/AuthDataRepository';

export class SaveAuthCreds {
  constructor(
    private readonly authDataRepository: AuthDataRepository,
    private readonly bufferConverter: any,
  ) {}

  async execute(sessionId: string, creds: any): Promise<void> {
    const key = `${sessionId}:auth_creds`;
    const serialized = JSON.stringify(this.bufferConverter.bufferToJSON(creds));
    await this.authDataRepository.save(key, serialized);
  }
}
