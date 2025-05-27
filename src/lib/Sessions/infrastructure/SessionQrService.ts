import { Injectable } from '@nestjs/common';
import { ISocketFactory } from './interfaces/ISocketFactory';
import { ISessionLogger } from './interfaces/ISessionLogger';

@Injectable()
export class SessionQrService {
  private socketFactories: Map<string, ISocketFactory> = new Map();

  constructor(private readonly logger: ISessionLogger) {}

  setSocketFactory(sessionId: string, factory: ISocketFactory): void {
    if (!factory) {
      this.logger.error('Cannot set null or undefined socket factory', null, sessionId);
      throw new Error('Socket factory cannot be null or undefined');
    }
    
    this.socketFactories.set(sessionId, factory);
    this.logger.info('Socket factory registered', sessionId);
  }

  removeSocketFactory(sessionId: string): void {
    const removed = this.socketFactories.delete(sessionId);
    if (removed) {
      this.logger.info('Socket factory removed', sessionId);
    }
  }

  getQr(sessionId: string): string | null {
    const socketFactory = this.socketFactories.get(sessionId);
    if (!socketFactory) {
      this.logger.warn('No socket factory found for session', sessionId);
      return null;
    }

    try {
      return socketFactory.getQR(sessionId);
    } catch (error) {
      this.logger.error('Error getting QR from socket factory', error, sessionId);
      return null;
    }
  }

  hasQr(sessionId: string): boolean {
    const socketFactory = this.socketFactories.get(sessionId);
    if (!socketFactory) {
      return false;
    }

    try {
      return socketFactory.hasQR(sessionId);
    } catch (error) {
      this.logger.error('Error checking QR existence', error, sessionId);
      return false;
    }
  }

  async getQrAsBase64(sessionId: string): Promise<string | null> {
    const socketFactory = this.socketFactories.get(sessionId);
    if (!socketFactory) {
      this.logger.warn('No socket factory found for session', sessionId);
      return null;
    }

    try {
      return await socketFactory.getQRAsBase64(sessionId);
    } catch (error) {
      this.logger.error('Error getting QR as base64', error, sessionId);
      return null;
    }
  }

  hasSocketFactory(sessionId: string): boolean {
    return this.socketFactories.has(sessionId);
  }

  getRegisteredSessions(): string[] {
    return Array.from(this.socketFactories.keys());
  }
}
