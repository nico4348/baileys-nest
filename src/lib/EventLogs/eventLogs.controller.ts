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
  Query,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { EventLogsCreate } from './application/EventLogsCreate';
import { EventLogsGetAll } from './application/EventLogsGetAll';
import { EventLogsGetOneById } from './application/EventLogsGetOneById';
import { EventLogsGetBySessionId } from './application/EventLogsGetBySessionId';
import { EventLogsGetByEventId } from './application/EventLogsGetByEventId';
import { EventLogsUpdate } from './application/EventLogsUpdate';
import { EventLogsDelete } from './application/EventLogsDelete';

@Controller('event-logs')
export class EventLogsController {
  constructor(
    @Inject('EventLogsCreate')
    private readonly eventLogsCreate: EventLogsCreate,
    @Inject('EventLogsGetAll')
    private readonly eventLogsGetAll: EventLogsGetAll,
    @Inject('EventLogsGetOneById')
    private readonly eventLogsGetOneById: EventLogsGetOneById,
    @Inject('EventLogsGetBySessionId')
    private readonly eventLogsGetBySessionId: EventLogsGetBySessionId,
    @Inject('EventLogsGetByEventId')
    private readonly eventLogsGetByEventId: EventLogsGetByEventId,
    @Inject('EventLogsUpdate')
    private readonly eventLogsUpdate: EventLogsUpdate,
    @Inject('EventLogsDelete')
    private readonly eventLogsDelete: EventLogsDelete,
  ) {}

  @Post()
  async create(
    @Body() createEventLogDto: { session_id: string; event_id: string },
  ) {
    try {
      const id = uuidv4();
      const createdAt = new Date();
      await this.eventLogsCreate.run(
        id,
        createEventLogDto.session_id,
        createEventLogDto.event_id,
        createdAt,
      );
      return {
        success: true,
        data: {
          id,
          session_id: createEventLogDto.session_id,
          event_id: createEventLogDto.event_id,
          created_at: createdAt,
        },
        message: 'Event log created successfully',
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
  async findAll(
    @Query('session_id') sessionId?: string,
    @Query('event_id') eventId?: string,
  ) {
    try {
      let eventLogs;
      if (sessionId) {
        eventLogs = await this.eventLogsGetBySessionId.run(sessionId);
      } else if (eventId) {
        eventLogs = await this.eventLogsGetByEventId.run(eventId);
      } else {
        eventLogs = await this.eventLogsGetAll.run();
      }

      return {
        success: true,
        data: eventLogs,
        message: 'Event logs retrieved successfully',
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
      const eventLog = await this.eventLogsGetOneById.run(id);
      if (!eventLog) {
        throw new HttpException(
          {
            success: false,
            message: 'Event log not found',
          },
          HttpStatus.NOT_FOUND,
        );
      }
      return {
        success: true,
        data: eventLog,
        message: 'Event log retrieved successfully',
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
    @Body() updateEventLogDto: { session_id: string; event_id: string },
  ) {
    try {
      const createdAt = new Date();
      await this.eventLogsUpdate.run(
        id,
        updateEventLogDto.session_id,
        updateEventLogDto.event_id,
        createdAt,
      );
      return {
        success: true,
        data: {
          id,
          session_id: updateEventLogDto.session_id,
          event_id: updateEventLogDto.event_id,
          created_at: createdAt,
        },
        message: 'Event log updated successfully',
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
      await this.eventLogsDelete.run(id);
      return {
        success: true,
        message: 'Event log deleted successfully',
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
