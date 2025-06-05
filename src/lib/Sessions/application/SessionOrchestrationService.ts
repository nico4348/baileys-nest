import { Injectable, Inject } from '@nestjs/common';
import { SessionStatePort } from '../domain/ports/SessionStatePort';
import { ConnectionPort } from '../domain/ports/ConnectionPort';
import { delay } from 'baileys';

@Injectable()
export class SessionOrchestrationService {
  constructor(
    @Inject('SessionStatePort')
    private readonly sessionState: SessionStatePort,
    @Inject('ConnectionPort')
    private readonly connection: ConnectionPort,
  ) {
    // La configuración de la dependencia circular se maneja en el módulo
  }

  async startSession(sessionId: string): Promise<any> {
    return await this.sessionState.startSession(sessionId);
  }

  async resumeSession(sessionId: string): Promise<any> {
    return await this.sessionState.resumeSession(sessionId);
  }

  async recreateSession(sessionId: string): Promise<any> {
    return await this.sessionState.recreateSession(sessionId);
  }

  async pauseSession(sessionId: string): Promise<void> {
    return await this.sessionState.pauseSession(sessionId);
  }

  async deleteSession(sessionId: string): Promise<void> {
    return await this.sessionState.deleteSession(sessionId);
  }

  async isSessionPaused(sessionId: string): Promise<boolean> {
    return await this.sessionState.isSessionPaused(sessionId);
  }

  isSessionRestarting(sessionId: string): boolean {
    return this.sessionState.isSessionRestarting(sessionId);
  }

  isSessionDeleting(sessionId: string): boolean {
    return this.sessionState.isSessionDeleting(sessionId);
  }

  getSocket(sessionId: string): any | null {
    return this.sessionState.getSocket(sessionId);
  }

  getSessionQR(sessionId: string): string | null {
    return this.sessionState.getSessionQR(sessionId);
  }

  hasSessionQR(sessionId: string): boolean {
    return this.sessionState.hasSessionQR(sessionId);
  }

  async getSessionQRAsBase64(sessionId: string): Promise<string | null> {
    return await this.sessionState.getSessionQRAsBase64(sessionId);
  }

  async handleConnectionUpdate(sessionId: string, update: any): Promise<void> {
    return await this.connection.handleConnectionUpdate(sessionId, update);
  }

  async handleCredentialsUpdate(sessionId: string): Promise<void> {
    return await this.connection.handleCredentialsUpdate(sessionId);
  }

  async simulateTypingPresence(sessionId: string, jid: string, tiempo_ms: number): Promise<void> {
    const socket = this.getSocket(sessionId);
    if (!socket) {
      throw new Error(`Session ${sessionId} not found or not connected`);
    }

    try {
      await socket.sendPresenceUpdate('available');
      await socket.presenceSubscribe(jid);
      await socket.sendPresenceUpdate('available', jid);
      await delay(500);

      await socket.sendPresenceUpdate('composing', jid);
      await delay(tiempo_ms);

      await socket.sendPresenceUpdate('paused', jid);
    } catch (error) {
      console.error(`Error simulating typing presence for ${jid}:`, error);
      throw error;
    }
  }

  async simulateRecordingPresence(sessionId: string, jid: string, tiempo_ms: number): Promise<void> {
    const socket = this.getSocket(sessionId);
    if (!socket) {
      throw new Error(`Session ${sessionId} not found or not connected`);
    }

    try {
      await socket.sendPresenceUpdate('available');
      await socket.presenceSubscribe(jid);
      await socket.sendPresenceUpdate('available', jid);
      await delay(500);

      await socket.sendPresenceUpdate('recording', jid);
      await delay(tiempo_ms);

      await socket.sendPresenceUpdate('paused', jid);
    } catch (error) {
      console.error(`Error simulating recording presence for ${jid}:`, error);
      throw error;
    }
  }
}
