import { SessionEvent } from './SessionEvent';

export class SessionStartedEvent extends SessionEvent {
  constructor(sessionId: string) {
    super(sessionId);
  }

  eventName(): string {
    return 'session.started';
  }
}