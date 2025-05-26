import { Injectable } from '@nestjs/common';
import { AuthStateService } from './AuthStateService';

@Injectable()
export class AuthStateFactory {
  constructor(private readonly authStateService: AuthStateService) {}
  async createAuthState(sessionId: string) {
    const state = await this.authStateService.getAuthState(sessionId);

    return {
      state,
      saveCreds: async () => {
        // Guardar las credenciales actuales del state, no las originales
        await this.authStateService.saveCreds(sessionId, state.creds);
      },
      deleteSession: async () => {
        await this.authStateService.deleteSession(sessionId);
      },
    };
  }

  async useAuthState(sessionId: string) {
    const state = await this.authStateService.getAuthState(sessionId);

    return {
      state,
      saveCreds: async () => {
        await this.authStateService.saveCreds(sessionId, state.creds);
      },
      deleteSession: async () => {
        await this.authStateService.deleteSession(sessionId);
      },
    };
  }
}
