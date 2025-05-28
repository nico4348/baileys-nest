import { Injectable } from '@nestjs/common';
import { EventLogsCreate } from '../application/EventLogsCreate';
import { EventsGetOneByName } from '../../Events/application/EventsGetOneByName';
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
        await this.eventLogsCreate.run(
          uuidv4(),
          sessionId,
          eventId,
          new Date(),
        );
      }
    } catch (error) {
      console.error(
        `Error logging event ${eventName} for session ${sessionId}:`,
        error,
      );
    }
  }

  setEventId(eventName: string, eventId: string): void {
    this.eventTypesMap.set(eventName, eventId);
  }

  getEventId(eventName: string): string | undefined {
    return this.eventTypesMap.get(eventName);
  }
}
