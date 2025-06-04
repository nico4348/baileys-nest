import { Injectable } from '@nestjs/common';
import { EventLogsCreate } from '../application/EventLogsCreate';
import { EventsGetOneByName } from '../../Events/application/EventsGetOneByName';
import { EventLoggingQueue } from './EventLoggingQueue';
import { v4 as uuidv4 } from 'uuid';

export interface IBaileysEventLogger {
  logEvent(sessionId: string, eventName: string): Promise<void>;
}

@Injectable()
export class BaileysEventLogger implements IBaileysEventLogger {
  private eventTypesMap: Map<string, string> = new Map();

  constructor(
    private readonly eventLogsCreate: EventLogsCreate,
    private readonly eventsGetOneByName: EventsGetOneByName,
    private readonly eventLoggingQueue: EventLoggingQueue,
  ) {}

  async logEvent(sessionId: string, eventName: string): Promise<void> {
    try {
      let eventId = this.eventTypesMap.get(eventName);
      
      if (!eventId) {
        const event = await this.eventsGetOneByName.run(eventName);
        if (event) {
          eventId = event.id.value;
          this.eventTypesMap.set(eventName, eventId);
        }
      }

      if (eventId) {
        // Queue the event log instead of creating directly
        await this.eventLoggingQueue.addEventLog({
          sessionId,
          eventId,
          eventData: { eventName },
          timestamp: new Date(),
          category: this.getEventCategory(eventName),
        });
      }
    } catch (error) {
      console.error(
        `Error queueing event ${eventName} for session ${sessionId}:`,
        error,
      );
    }
  }

  private getEventCategory(eventName: string): 'connection' | 'message' | 'system' | 'error' {
    if (eventName.includes('connection')) return 'connection';
    if (eventName.includes('message') || eventName.includes('chat')) return 'message';
    if (eventName.includes('error') || eventName.includes('fail')) return 'error';
    return 'system';
  }

  setEventId(eventName: string, eventId: string): void {
    this.eventTypesMap.set(eventName, eventId);
  }

  getEventId(eventName: string): string | undefined {
    return this.eventTypesMap.get(eventName);
  }
}
