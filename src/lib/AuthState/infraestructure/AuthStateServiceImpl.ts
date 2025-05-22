import { Injectable } from '@nestjs/common';
import { AuthStateService } from '../application/AuthStateService';
import { GetAuthState } from '../application/GetAuthState';
import { SaveAuthCreds } from '../application/SaveAuthCreds';
import { DeleteAuthSession } from '../application/DeleteAuthSession';
import { AuthDataRepository } from '../domain/AuthDataRepository';
import { BufferConverter } from './BufferConverter';
import { AuthCredsFactory } from './AuthCredsFactory';

@Injectable()
export class AuthStateServiceImpl implements AuthStateService {
  private readonly getAuthStateUseCase: GetAuthState;
  private readonly saveAuthCreds: SaveAuthCreds;
  private readonly deleteAuthSession: DeleteAuthSession;
  private readonly bufferConverter: BufferConverter;

  constructor(authDataRepository: AuthDataRepository) {
    this.bufferConverter = new BufferConverter();
    const authCredsFactory = new AuthCredsFactory();

    this.getAuthStateUseCase = new GetAuthState(
      authDataRepository,
      this.bufferConverter,
      authCredsFactory,
    );

    this.saveAuthCreds = new SaveAuthCreds(
      authDataRepository,
      this.bufferConverter,
    );

    this.deleteAuthSession = new DeleteAuthSession(authDataRepository);
  }

  async getAuthState(sessionId: string): Promise<any> {
    return this.getAuthStateUseCase.execute(sessionId);
  }

  async saveCreds(sessionId: string, creds: any): Promise<void> {
    await this.saveAuthCreds.execute(sessionId, creds);
  }

  async deleteSession(sessionId: string): Promise<void> {
    await this.deleteAuthSession.execute(sessionId);
  }

  private getKey(sessionId: string, key: string): string {
    return `${sessionId}:${key}`;
  }

  async writeData(sessionId: string, key: string, data: any): Promise<void> {
    const serialized = JSON.stringify(this.bufferConverter.bufferToJSON(data));
    await this.saveAuthCreds.execute(this.getKey(sessionId, key), serialized);
  }

  async readData(sessionId: string, key: string): Promise<any | null> {
    // En una implementación real, esto usaría un caso de uso específico
    const result = await this.getAuthStateUseCase.execute(sessionId);
    const specificKey = this.getKey(sessionId, key);
    // Buscar en el resultado el valor específico
    // Esta implementación es simplificada para el ejemplo
    return null;
  }

  async removeData(sessionId: string, key: string): Promise<void> {
    // Implementación similar que usaría un caso de uso específico
  }
}
