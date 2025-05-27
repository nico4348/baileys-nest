export abstract class SessionEvent {
  public readonly occurredOn: Date;
  public readonly sessionId: string;

  constructor(sessionId: string) {
    this.sessionId = sessionId;
    this.occurredOn = new Date();
  }

  abstract eventName(): string;
}