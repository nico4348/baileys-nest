import { Injectable } from '@nestjs/common';
import { SessionsStart } from '../application/SessionsStart';
import { SessionsResume } from '../application/SessionsResume';
import { SessionsRestart } from '../application/SessionsRestart';
import { SessionsStop } from '../application/SessionsStop';
import { SessionsDelete } from '../application/SessionsDelete';
import { ISessionLogger } from './interfaces/ISessionLogger';

@Injectable()
export class SessionOperationsService {
  constructor(
    private readonly sessionsStart: SessionsStart,
    private readonly sessionsResume: SessionsResume,
    private readonly sessionsRestart: SessionsRestart,
    private readonly sessionsStop: SessionsStop,
    private readonly sessionsDelete: SessionsDelete,
    private readonly logger: ISessionLogger,
  ) {}

  async startSession(sessionId: string): Promise<void> {
    try {
      await this.sessionsStart.run(sessionId);
      this.logger.info('Session started', sessionId);
    } catch (error) {
      this.logger.error('Failed to start session', error, sessionId);
      throw error;
    }
  }

  async resumeSession(sessionId: string): Promise<void> {
    try {
      await this.sessionsResume.run(sessionId);
      this.logger.info('Session resumed', sessionId);
    } catch (error) {
      this.logger.error('Failed to resume session', error, sessionId);
      throw error;
    }
  }

  async restartSession(sessionId: string): Promise<void> {
    try {
      await this.sessionsRestart.run(sessionId);
      this.logger.info('Session restarted', sessionId);
    } catch (error) {
      this.logger.error('Failed to restart session', error, sessionId);
      throw error;
    }
  }

  async stopSession(sessionId: string): Promise<void> {
    try {
      await this.sessionsStop.run(sessionId);
      this.logger.info('Session stopped', sessionId);
    } catch (error) {
      this.logger.error('Failed to stop session', error, sessionId);
      throw error;
    }
  }

  async deleteSession(sessionId: string): Promise<void> {
    try {
      await this.sessionsDelete.run(sessionId);
      this.logger.info('Session deleted', sessionId);
    } catch (error) {
      this.logger.error('Failed to delete session', error, sessionId);
      throw error;
    }
  }
}