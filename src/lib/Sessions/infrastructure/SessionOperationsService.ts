import { Injectable, Inject } from '@nestjs/common';
import { SessionsStart } from '../application/SessionsStart';
import { SessionsResume } from '../application/SessionsResume';
import { SessionsRestart } from '../application/SessionsRestart';
import { SessionsStop } from '../application/SessionsStop';
import { SessionsDelete } from '../application/SessionsDelete';
import { ISessionLogger } from './interfaces/ISessionLogger';
import { ISessionLogLogger } from '../../SessionLogs/infrastructure/interfaces/ISessionLogLogger';

@Injectable()
export class SessionOperationsService {
  constructor(
    private readonly sessionsStart: SessionsStart,
    private readonly sessionsResume: SessionsResume,
    private readonly sessionsRestart: SessionsRestart,
    private readonly sessionsStop: SessionsStop,
    private readonly sessionsDelete: SessionsDelete,
    private readonly logger: ISessionLogger,
    @Inject('ISessionLogLogger')
    private readonly sessionLogLogger: ISessionLogLogger,
  ) {}

  async startSession(sessionId: string): Promise<void> {
    try {
      await this.sessionsStart.run(sessionId);
      this.logger.info('Session started', sessionId);
      await this.sessionLogLogger.logSessionStart(sessionId);
    } catch (error) {
      this.logger.error('Failed to start session', error, sessionId);
      await this.sessionLogLogger.logError(sessionId, error, 'Session start failed');
      throw error;
    }
  }

  async resumeSession(sessionId: string): Promise<void> {
    try {
      await this.sessionsResume.run(sessionId);
      this.logger.info('Session resumed', sessionId);
      await this.sessionLogLogger.logSessionResume(sessionId);
    } catch (error) {
      this.logger.error('Failed to resume session', error, sessionId);
      await this.sessionLogLogger.logError(sessionId, error, 'Session resume failed');
      throw error;
    }
  }

  async restartSession(sessionId: string): Promise<void> {
    try {
      await this.sessionsRestart.run(sessionId);
      this.logger.info('Session restarted', sessionId);
      await this.sessionLogLogger.logReconnection(sessionId, 'Manual restart');
    } catch (error) {
      this.logger.error('Failed to restart session', error, sessionId);
      await this.sessionLogLogger.logError(sessionId, error, 'Session restart failed');
      throw error;
    }
  }

  async pauseSession(sessionId: string): Promise<void> {
    try {
      // Para pause, solo cambiar el estado en la BD sin hacer logout completo
      await this.sessionsStop.run(sessionId);
      this.logger.info('Session paused', sessionId);
      await this.sessionLogLogger.logSessionPause(sessionId);
    } catch (error) {
      this.logger.error('Failed to pause session', error, sessionId);
      await this.sessionLogLogger.logError(sessionId, error, 'Session pause failed');
      throw error;
    }
  }

  async deleteSession(sessionId: string): Promise<void> {
    try {
      await this.sessionsDelete.run(sessionId);
      this.logger.info('Session deleted', sessionId);
      await this.sessionLogLogger.logInfo(sessionId, 'Session deleted permanently');
    } catch (error) {
      this.logger.error('Failed to delete session', error, sessionId);
      await this.sessionLogLogger.logError(sessionId, error, 'Session deletion failed');
      throw error;
    }
  }
}
