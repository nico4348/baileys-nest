import { SessionEvent } from '../../domain/events/SessionEvent';

export interface IEventPublisher {
  publish(event: SessionEvent): Promise<void>;
  publishMany(events: SessionEvent[]): Promise<void>;
}
