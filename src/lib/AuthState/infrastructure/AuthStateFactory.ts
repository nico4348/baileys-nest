import { Injectable, Inject } from '@nestjs/common';
import { AuthStateGet } from '../application/AuthStateGet';
import { AuthStateSaveCredentials } from '../application/AuthStateSaveCredentials';
import { AuthStateDeleteSession } from '../application/AuthStateDeleteSession';

@Injectable()
export class AuthStateFactory {
  constructor(
    @Inject('AuthStateGet') private readonly authStateGet: AuthStateGet,
    @Inject('AuthStateSaveCredentials')
    private readonly authStateSaveCredentials: AuthStateSaveCredentials,
    @Inject('AuthStateDeleteSession')
    private readonly authStateDeleteSession: AuthStateDeleteSession,
  ) {}
  async createAuthState(sessionId: string) {
    const state = await this.authStateGet.run(sessionId);

    return {
      state,
      saveCreds: async () => {
        // Guardar las credenciales actuales del state, no las originales
        await this.authStateSaveCredentials.run(sessionId, state.creds);
      },
      deleteSession: async () => {
        await this.authStateDeleteSession.run(sessionId);
      },
    };
  }
  async useAuthState(sessionId: string) {
    const state = await this.authStateGet.run(sessionId);

    return {
      state,
      saveCreds: async () => {
        await this.authStateSaveCredentials.run(sessionId, state.creds);
      },
      deleteSession: async () => {
        await this.authStateDeleteSession.run(sessionId);
      },
    };
  }
}
