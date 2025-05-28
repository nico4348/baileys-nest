import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Inject,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { EventsCreate } from './application/EventsCreate';
import { EventsGetAll } from './application/EventsGetAll';
import { EventsGetOneById } from './application/EventsGetOneById';
import { EventsUpdate } from './application/EventsUpdate';
import { EventsDelete } from './application/EventsDelete';
import { EventSeeder } from './infrastructure/EventSeeder';
import { v4 as uuidv4 } from 'uuid';

@Controller('events')
export class EventsController {
  constructor(
    @Inject('EventsCreate')
    private readonly eventsCreate: EventsCreate,
    @Inject('EventsGetAll')
    private readonly eventsGetAll: EventsGetAll,
    @Inject('EventsGetOneById')
    private readonly eventsGetOneById: EventsGetOneById,
    @Inject('EventsUpdate')
    private readonly eventsUpdate: EventsUpdate,
    @Inject('EventsDelete')
    private readonly eventsDelete: EventsDelete,
    private readonly eventSeeder: EventSeeder,
  ) {}

  @Post()
  async create(
    @Body() createEventDto: { event_name: string; description: string },
  ) {
    try {
      const id = uuidv4();
      const createdAt = new Date();
      await this.eventsCreate.run(
        id,
        createEventDto.event_name,
        createEventDto.description,
        createdAt,
      );
      return {
        success: true,
        data: {
          id,
          event_name: createEventDto.event_name,
          description: createEventDto.description,
          created_at: createdAt,
        },
        message: 'Event created successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get()
  async findAll() {
    try {
      const events = await this.eventsGetAll.run();
      return {
        success: true,
        data: events,
        message: 'Events retrieved successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const event = await this.eventsGetOneById.run(id);
      if (!event) {
        throw new HttpException(
          {
            success: false,
            message: 'Event not found',
          },
          HttpStatus.NOT_FOUND,
        );
      }
      return {
        success: true,
        data: event,
        message: 'Event retrieved successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message,
        },
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateEventDto: { event_name?: string; description?: string },
  ) {
    try {
      // First get the existing event to preserve created_at
      const existingEvent = await this.eventsGetOneById.run(id);
      if (!existingEvent) {
        throw new HttpException(
          {
            success: false,
            message: 'Event not found',
          },
          HttpStatus.NOT_FOUND,
        );
      }

      await this.eventsUpdate.run(
        id,
        updateEventDto.event_name || existingEvent.event_name.value,
        updateEventDto.description || existingEvent.description.value,
        existingEvent.created_at.value,
      );

      // Get updated event to return
      const updatedEvent = await this.eventsGetOneById.run(id);
      return {
        success: true,
        data: updatedEvent,
        message: 'Event updated successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      await this.eventsDelete.run(id);
      return {
        success: true,
        message: 'Event deleted successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
