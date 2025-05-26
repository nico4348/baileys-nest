import { AuthenticationCreds } from 'baileys';
import { BufferConverter } from '../Utils/Utils';
import { AuthStateRepository } from '../domain/AuthStateRepository';
import { AuthStateSessionKey } from '../domain/AuthStateSessionKey';

export class AuthStateSaveCredentials {
  private bufferConverter = new BufferConverter();

  constructor(private readonly authStateRepository: AuthStateRepository) {}
  async run(sessionId: string, creds: AuthenticationCreds): Promise<void> {
    const credKey = `${sessionId}:auth_creds`;
    const serializedCreds = JSON.stringify(
      this.bufferConverter.bufferToJSON(creds),
    );

    try {
      await this.authStateRepository.save(
        new AuthStateSessionKey(credKey),
        serializedCreds,
      );
    } catch (error) {
      throw error;
    }
  }
}
