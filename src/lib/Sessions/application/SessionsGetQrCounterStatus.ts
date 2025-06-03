import { Injectable, Inject } from '@nestjs/common';
import { SessionsGetOneById } from './SessionsGetOneById';
import { QrCounterPort } from '../domain/ports/QrCounterPort';
import { NotFoundException } from '@nestjs/common';

@Injectable()
export class SessionsGetQrCounterStatus {
  constructor(
    @Inject('QrCounterPort') private readonly qrCounter: QrCounterPort,
    private readonly sessionsGetOneById: SessionsGetOneById,
  ) {}

  async run(sessionId: string) {
    const session = await this.sessionsGetOneById.run(sessionId);
    if (!session) {
      throw new NotFoundException('Sesión no encontrada');
    }

    const current = this.qrCounter.getCurrentCount(sessionId);
    const max = this.qrCounter.getMaxLimit();
    const remaining = this.qrCounter.getRemainingAttempts(sessionId);
    const exceeded = this.qrCounter.hasExceededLimit(sessionId);
    const canGenerate = this.qrCounter.canGenerateQr(sessionId);

    return {
      sessionId,
      currentQrCount: current,
      maxQrLimit: max,
      remainingAttempts: remaining,
      hasExceededLimit: exceeded,
      canGenerateMoreQr: canGenerate,
      status: exceeded ? 'LIMIT_EXCEEDED' : 'ACTIVE',
    };
  }
}
