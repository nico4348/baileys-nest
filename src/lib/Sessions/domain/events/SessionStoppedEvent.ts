import { SessionEvent } from './SessionEvent';

export class SessionStoppedEvent extends SessionEvent {
  constructor(sessionId: string) {
    super(sessionId);
  }

  eventName(): string {
    return 'session.stopped';
  }
}