import { Injectable, OnApplicationBootstrap, Inject } from '@nestjs/common';
import { EventsCreate } from '../application/EventsCreate';
import { EventsGetAll } from '../application/EventsGetAll';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class EventSeeder implements OnApplicationBootstrap {
  constructor(
    private readonly eventsCreate: EventsCreate,
    @Inject('EventsGetAll')
    private readonly eventsGetAll: EventsGetAll,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    try {
      const existingEvents = await this.eventsGetAll.run();

      if (existingEvents.length === 0) {
        await this.seedBaileysEvents();
      }
    } catch (error) {
      console.error('❌ Error during events seeding:', error.message);
    }
  }

  async seedBaileysEvents(): Promise<void> {
    const baileysEvents = [
      {
        name: 'connection.update',
        description:
          'Connection status updates including connecting, open, close states',
      },
      {
        name: 'creds.update',
        description: 'Authentication credentials update event',
      },
      {
        name: 'messages.upsert',
        description: 'New messages received or sent',
      },
      {
        name: 'messages.update',
        description: 'Message status updates (read, delivered, etc.)',
      },
      {
        name: 'message-receipt.update',
        description: 'Message receipt status updates',
      },
      {
        name: 'presence.update',
        description: 'Contact presence updates (online, offline, typing)',
      },
      {
        name: 'chats.upsert',
        description: 'New chats created or existing chats updated',
      },
      {
        name: 'chats.update',
        description: 'Chat information updates',
      },
      {
        name: 'chats.delete',
        description: 'Chats deleted',
      },
      {
        name: 'contacts.upsert',
        description: 'Contact list updates',
      },
      {
        name: 'contacts.update',
        description: 'Contact information updates',
      },
      {
        name: 'groups.upsert',
        description: 'Group information updates',
      },
      {
        name: 'groups.update',
        description: 'Group metadata updates',
      },
      {
        name: 'group-participants.update',
        description: 'Group participant changes (add, remove, promote, demote)',
      },
      {
        name: 'blocklist.set',
        description: 'Initial blocklist set',
      },
      {
        name: 'blocklist.update',
        description: 'Blocklist updates',
      },
      {
        name: 'call',
        description: 'Incoming or outgoing call events',
      },
      {
        name: 'labels.edit',
        description: 'Label editing events',
      },
      {
        name: 'labels.association',
        description: 'Label association with chats/messages',
      },
    ];

    for (const event of baileysEvents) {
      try {
        const id = uuidv4();
        const createdAt = new Date();
        await this.eventsCreate.run(
          id,
          event.name,
          event.description,
          createdAt,
        );
      } catch (error) {
        console.error(`Error seeding event '${event.name}':`, error.message);
      }
    }
  }
}
