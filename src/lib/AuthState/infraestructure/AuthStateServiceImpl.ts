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
  private readonly saveAuthCredsUseCase: SaveAuthCreds;
  private readonly deleteAuthSessionUseCase: DeleteAuthSession;
  private readonly bufferConverter: BufferConverter;

  constructor(authDataRepository: AuthDataRepository) {
    this.bufferConverter = new BufferConverter();
    const authCredsFactory = new AuthCredsFactory();

    this.getAuthStateUseCase = new GetAuthState(
      authDataRepository,
      this.bufferConverter,
      authCredsFactory,
    );

    this.saveAuthCredsUseCase = new SaveAuthCreds(
      authDataRepository,
      this.bufferConverter,
    );

    this.deleteAuthSessionUseCase = new DeleteAuthSession(authDataRepository);
  }

  async getAuthState(sessionId: string): Promise<any> {
    return this.getAuthStateUseCase.execute(sessionId);
  }

  async saveCreds(sessionId: string, creds: any): Promise<void> {
    await this.saveAuthCredsUseCase.execute(sessionId, creds);
  }

  async deleteSession(sessionId: string): Promise<void> {
    await this.deleteAuthSessionUseCase.execute(sessionId);
  }

  async writeData(sessionId: string, key: string, data: any): Promise<void> {
    // Esta sería una implementación simplificada para compatibilidad
    // En un sistema real, cada operación podría tener su propio caso de uso
    const fullKey = `${sessionId}:${key}`;
    const serialized = JSON.stringify(this.bufferConverter.bufferToJSON(data));
    // Usamos el repositorio directamente o creamos un caso de uso específico
  }

  async readData(sessionId: string, key: string): Promise<any | null> {
    // Implementación simplificada similar
    return null;
  }

  async removeData(sessionId: string, key: string): Promise<void> {
    // Implementación simplificada similar
  }
}
