import { Injectable, OnModuleInit } from '@nestjs/common';
import { SessionsRepository } from '../domain/SessionsRepository';
import { Session } from '../domain/Session';
import { ISessionLogger } from './interfaces/ISessionLogger';

@Injectable()
export class SessionLifecycleManager implements OnModuleInit {
  private sessions: Map<string, any> = new Map();
  private restarting: Set<string> = new Set();
  private deleting: Set<string> = new Set();
  private paused: Set<string> = new Set();

  constructor(
    private readonly sessionsRepository: SessionsRepository,
    private readonly logger: ISessionLogger,
  ) {}

  async onModuleInit(): Promise<void> {
    try {
      const allSessions: Session[] = await this.sessionsRepository.getAll();
      const activeSessions = allSessions.filter(
        (s) => s.status.value && !s.isDeleted.value,
      );

      for (const session of activeSessions) {
        // this.logger.info('Restoring session', session.id.value);
      }
    } catch (error) {
      this.logger.error('Failed to initialize sessions', error);
    }
  }

  storeSession(sessionId: string, socket: any): void {
    this.sessions.set(sessionId, socket);
  }

  getSession(sessionId: string): any {
    return this.sessions.get(sessionId);
  }

  removeSession(sessionId: string): void {
    const removed = this.sessions.delete(sessionId);
    if (removed) {
      // this.logger.info('Session removed from memory', sessionId);
    }
  }

  isSessionActive(sessionId: string): boolean {
    const socket = this.sessions.get(sessionId);
    return socket && socket.readyState === 1;
  }

  setRestarting(sessionId: string): void {
    this.restarting.add(sessionId);
    // this.logger.info('Session marked as restarting', sessionId);

    setTimeout(() => {
      this.restarting.delete(sessionId);
      // this.logger.info('Session restart flag removed', sessionId);
    }, 5000);
  }

  isRestarting(sessionId: string): boolean {
    return this.restarting.has(sessionId);
  }

  setPaused(sessionId: string): void {
    this.paused.add(sessionId);
    // this.logger.info('Session marked as paused', sessionId);
  }

  removePaused(sessionId: string): void {
    const removed = this.paused.delete(sessionId);
    if (removed) {
      // this.logger.info('Session paused flag removed', sessionId);
    }
  }

  isPaused(sessionId: string): boolean {
    return this.paused.has(sessionId);
  }

  setDeleting(sessionId: string): void {
    this.deleting.add(sessionId);
    // this.logger.info('Session marked as deleting', sessionId);

    setTimeout(() => {
      this.deleting.delete(sessionId);
      // this.logger.info('Session delete flag removed', sessionId);
    }, 10000);
  }

  isDeleting(sessionId: string): boolean {
    return this.deleting.has(sessionId);
  }
  async pauseSession(sessionId: string): Promise<void> {
    const socket = this.sessions.get(sessionId);
    if (!socket) return;

    try {
      // Solo cerrar la conexión sin hacer logout para preservar credenciales
      if (socket.end && typeof socket.end === 'function') {
        await socket.end();
        // this.logger.info(
        //   'Session connection paused (ended without logout)',
        //   sessionId,
        // );
      }
    } catch (error) {
      this.logger.warn('Error pausing session connection', sessionId);
    }

    this.removeSession(sessionId);
    this.setPaused(sessionId);
  }

  async resumeSession(sessionId: string, socketFactory: any): Promise<any> {
    if (!this.isPaused(sessionId)) {
      this.logger.warn('Session is not paused, cannot resume', sessionId);
      return null;
    }

    try {
      // Create new socket with existing credentials
      const socket = await socketFactory.createSocket(sessionId);
      this.storeSession(sessionId, socket);
      this.removePaused(sessionId);

      // this.logger.info('Resuming paused session', sessionId);

      return socket;
    } catch (error) {
      this.logger.error('Error resuming session', error, sessionId);
      throw error;
    }
  }

  async closeSession(sessionId: string): Promise<void> {
    const socket = this.sessions.get(sessionId);
    if (!socket) return;

    try {
      if (socket.logout && typeof socket.logout === 'function') {
        await socket.logout();
        // this.logger.info('Session logout completed', sessionId);
      }
    } catch (error) {
      this.logger.warn('Error during session logout', sessionId);
    }

    try {
      if (socket.end && typeof socket.end === 'function') {
        await socket.end();
        // this.logger.info('Session connection ended', sessionId);
      }
    } catch (error) {
      this.logger.warn('Error ending session connection', sessionId);
    }

    this.removeSession(sessionId);
  }
}
