import { SessionEvent } from './SessionEvent';

export class SessionDisconnectedEvent extends SessionEvent {
  public readonly reason?: string;

  constructor(sessionId: string, reason?: string) {
    super(sessionId);
    this.reason = reason;
  }

  eventName(): string {
    return 'session.disconnected';
  }
}