import { SessionEvent } from './SessionEvent';

export class SessionConnectedEvent extends SessionEvent {
  constructor(sessionId: string) {
    super(sessionId);
  }

  eventName(): string {
    return 'session.connected';
  }
}