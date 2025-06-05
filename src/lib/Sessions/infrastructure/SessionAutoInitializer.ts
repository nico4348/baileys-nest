import { Injectable, OnApplicationBootstrap, Inject } from '@nestjs/common';
import { WhatsAppSessionManager } from './WhatsAppSessionManager';
import { SessionsRepository } from '../domain/SessionsRepository';
import { ISessionLogger } from './interfaces/ISessionLogger';
import { Session } from '../domain/Session';

@Injectable()
export class SessionAutoInitializer implements OnApplicationBootstrap {
  constructor(
    private readonly sessionManager: WhatsAppSessionManager,
    @Inject('SessionsRepository')
    private readonly sessionsRepository: SessionsRepository,
    private readonly logger: ISessionLogger,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    try {
      await this.initializeActiveSessions();
    } catch (error) {
      this.logger.error('Failed to auto-initialize sessions', error);
    }
  }

  private async initializeActiveSessions(): Promise<void> {
    const allSessions: Session[] = await this.sessionsRepository.getAll();
    const activeSessions = allSessions.filter(
      (s) => s.status.value && !s.isDeleted.value,
    );

    if (activeSessions.length === 0) {
      return;
    }

    for (const session of activeSessions) {
      try {
        this.sessionManager.startSession(session.id.value).catch((error) => {
          this.logger.error(
            `❌ Failed to auto-start session: ${session.id.value}`,
            error,
          );
        });

        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        this.logger.error(
          `Error auto-starting session ${session.id.value}`,
          error,
        );
      }
    }
  }
}
