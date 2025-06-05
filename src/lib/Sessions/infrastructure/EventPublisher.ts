import { Injectable } from '@nestjs/common';
import { SessionEvent } from '../domain/events/SessionEvent';
import { IEventPublisher } from './interfaces/IEventPublisher';
import { ISessionLogger } from './interfaces/ISessionLogger';

@Injectable()
export class EventPublisher implements IEventPublisher {
  private handlers: Map<string, ((event: SessionEvent) => Promise<void>)[]> =
    new Map();

  constructor(private readonly logger: ISessionLogger) {}

  async publish(event: SessionEvent): Promise<void> {
    const eventName = event.eventName();
    const handlers = this.handlers.get(eventName) || [];

    const promises = handlers.map(async (handler) => {
      try {
        await handler(event);
      } catch (error) {
        this.logger.error(
          `Error handling event ${eventName}`,
          error,
          event.sessionId,
        );
      }
    });

    await Promise.allSettled(promises);
  }

  async publishMany(events: SessionEvent[]): Promise<void> {
    const promises = events.map((event) => this.publish(event));
    await Promise.allSettled(promises);
  }

  subscribe(
    eventName: string,
    handler: (event: SessionEvent) => Promise<void>,
  ): void {
    if (!this.handlers.has(eventName)) {
      this.handlers.set(eventName, []);
    }

    this.handlers.get(eventName)!.push(handler);
  }

  unsubscribe(
    eventName: string,
    handler: (event: SessionEvent) => Promise<void>,
  ): void {
    const handlers = this.handlers.get(eventName);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }
}
