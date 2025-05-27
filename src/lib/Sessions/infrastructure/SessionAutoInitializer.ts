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
    this.logger.info('Starting automatic session initialization');

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

    this.logger.info(
      `Found ${activeSessions.length} active sessions to auto-start`,
    );

    if (activeSessions.length === 0) {
      this.logger.info('No active sessions found for auto-initialization');
      return;
    }

    // Initialize sessions with a small delay between each to avoid overwhelming the system
    for (const session of activeSessions) {
      try {
        this.logger.info(
          `Auto-starting session: ${session.id.value} (${session.sessionName.value})`,
        );

        // Start the session in the background
        this.sessionManager
          .startSession(session.id.value)
          .then(() => {
            this.logger.info(
              `✅ Session auto-started successfully: ${session.id.value}`,
            );
          })
          .catch((error) => {
            this.logger.error(
              `❌ Failed to auto-start session: ${session.id.value}`,
              error,
            );
          });

        // Small delay between session starts to prevent system overload
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        this.logger.error(
          `Error auto-starting session ${session.id.value}`,
          error,
        );
      }
    }

    this.logger.info('All active sessions queued for auto-initialization');
  }
}
