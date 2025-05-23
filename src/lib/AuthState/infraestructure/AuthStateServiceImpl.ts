import { Injectable } from '@nestjs/common';
import { AuthStateService } from '../application/AuthStateService';
import { GetAuthState } from '../application/GetAuthState';
import { SaveAuthCreds } from '../application/SaveAuthCreds';
import { DeleteAuthSession } from '../application/DeleteAuthSession';
import { AuthDataRepository } from '../domain/AuthDataRepository';
import { BufferConverter } from './BufferConverter';
import { AuthCredsFactory } from './AuthCredsFactory';
import { SessionId } from '../domain/SessionId';
import { WriteData } from '../application/WriteData';
import { ReadData } from '../application/ReadData';
import { RemoveData } from '../application/RemoveData';

@Injectable()
export class AuthStateServiceImpl implements AuthStateService {
  private readonly getAuthStateUseCase: GetAuthState;
  private readonly saveAuthCredsUseCase: SaveAuthCreds;
  private readonly deleteAuthSessionUseCase: DeleteAuthSession;
  private readonly bufferConverter: BufferConverter;
  private readonly writeDataUseCase: WriteData;
  private readonly readDataUseCase: ReadData;
  private readonly removeDataUseCase: RemoveData;

  constructor(authDataRepository: AuthDataRepository) {
    this.bufferConverter = new BufferConverter();
    const authCredsFactory = new AuthCredsFactory();

    this.getAuthStateUseCase = new GetAuthState(
      authDataRepository,
      authCredsFactory,
    );

    this.saveAuthCredsUseCase = new SaveAuthCreds(
      authDataRepository,
      this.bufferConverter,
    );

    this.deleteAuthSessionUseCase = new DeleteAuthSession(authDataRepository);
    this.writeDataUseCase = new WriteData(
      authDataRepository,
      this.bufferConverter,
    );
    this.readDataUseCase = new ReadData(
      authDataRepository,
      this.bufferConverter,
    );
    this.removeDataUseCase = new RemoveData(authDataRepository);
  }

  async getAuthState(sessionId: string): Promise<any> {
    return this.getAuthStateUseCase.run(new SessionId(sessionId));
  }

  async saveCreds(sessionId: string, creds: any): Promise<void> {
    await this.saveAuthCredsUseCase.run(sessionId, creds);
  }

  async deleteSession(sessionId: string): Promise<void> {
    await this.deleteAuthSessionUseCase.run(sessionId);
  }

  async writeData(sessionId: string, key: string, data: any): Promise<void> {
    await this.writeDataUseCase.run(sessionId, key, data);
  }

  async readData(sessionId: string, key: string): Promise<any | null> {
    return this.readDataUseCase.run(sessionId, key);
  }

  async removeData(sessionId: string, key: string): Promise<void> {
    await this.removeDataUseCase.run(sessionId, key);
  }
}
