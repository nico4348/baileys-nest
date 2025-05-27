import { SessionEvent } from './SessionEvent';

export class SessionQrGeneratedEvent extends SessionEvent {
  public readonly qrCode: string;

  constructor(sessionId: string, qrCode: string) {
    super(sessionId);
    this.qrCode = qrCode;
  }

  eventName(): string {
    return 'session.qr.generated';
  }
}