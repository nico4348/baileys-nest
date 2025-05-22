import { Injectable } from '@nestjs/common';
import { AuthStateService } from '../application/AuthStateService';

@Injectable()
export class AuthStateFactory {
  constructor(private readonly authStateService: AuthStateService) {}

  async createAuthState(sessionId: string) {
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
