import { Injectable } from '@nestjs/common';
import { ISessionLogger } from './interfaces/ISessionLogger';
import { QrCounterPort } from '../domain/ports/QrCounterPort';

@Injectable()
export class QrCounterManager implements QrCounterPort {
  private qrCounters: Map<string, number> = new Map();
  private readonly MAX_QR_LIMIT = 10;

  constructor(private readonly logger: ISessionLogger) {}

  incrementCounter(sessionId: string): number {
    const currentCount = this.qrCounters.get(sessionId) || 0;
    const newCount = currentCount + 1;
    this.qrCounters.set(sessionId, newCount);

    this.logger.info(
      `QR counter incremented to ${newCount}/${this.MAX_QR_LIMIT}`,
      sessionId,
    );

    return newCount;
  }

  hasExceededLimit(sessionId: string): boolean {
    const count = this.qrCounters.get(sessionId) || 0;
    return count >= this.MAX_QR_LIMIT;
  }

  canGenerateQr(sessionId: string): boolean {
    return !this.hasExceededLimit(sessionId);
  }

  getCurrentCount(sessionId: string): number {
    return this.qrCounters.get(sessionId) || 0;
  }

  resetCounter(sessionId: string): void {
    this.qrCounters.delete(sessionId);
    this.logger.info(
      'QR counter reset due to successful connection',
      sessionId,
    );
  }

  getRemainingAttempts(sessionId: string): number {
    const currentCount = this.getCurrentCount(sessionId);
    return Math.max(0, this.MAX_QR_LIMIT - currentCount);
  }

  removeSession(sessionId: string): void {
    this.qrCounters.delete(sessionId);
    this.logger.info('QR counter removed for session cleanup', sessionId);
  }

  getMaxLimit(): number {
    return this.MAX_QR_LIMIT;
  }
}
