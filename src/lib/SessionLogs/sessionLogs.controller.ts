import {
  Controller,
  Get,
  Delete,
  Param,
  Query,
  ParseIntPipe,
  ValidationPipe,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { SessionLogsGetAll } from './application/SessionLogsGetAll';
import { SessionLogsGetOneById } from './application/SessionLogsGetOneById';
import { SessionLogsGetBySessionId } from './application/SessionLogsGetBySessionId';
import { SessionLogsGetBySessionIdAndType } from './application/SessionLogsGetBySessionIdAndType';
import { SessionLogsGetRecent } from './application/SessionLogsGetRecent';
import { SessionLogsDelete } from './application/SessionLogsDelete';
import { SessionLogsDeleteBySessionId } from './application/SessionLogsDeleteBySessionId';
import { SessionLogsCleanup } from './application/SessionLogsCleanup';
import { SessionLog } from './domain/SessionLog';

@Controller('session-logs')
export class SessionLogsController {
  constructor(
    private readonly sessionLogsGetAll: SessionLogsGetAll,
    private readonly sessionLogsGetOneById: SessionLogsGetOneById,
    private readonly sessionLogsGetBySessionId: SessionLogsGetBySessionId,
    private readonly sessionLogsGetBySessionIdAndType: SessionLogsGetBySessionIdAndType,
    private readonly sessionLogsGetRecent: SessionLogsGetRecent,
    private readonly sessionLogsDelete: SessionLogsDelete,
    private readonly sessionLogsDeleteBySessionId: SessionLogsDeleteBySessionId,
    private readonly sessionLogsCleanup: SessionLogsCleanup,
  ) {}

  private serializeSessionLog(log: SessionLog): any {
    return {
      id: log.id.toString(),
      sessionId: log.sessionId.value,
      logType: log.logType.toString(),
      message: log.message.value,
      createdAt: log.createdAt.toString(),
      metadata: log.metadata,
    };
  }
  @Get()
  async getAllSessionLogs(): Promise<any[]> {
    try {
      const sessionLogs = await this.sessionLogsGetAll.run();
      return sessionLogs.map((log) => this.serializeSessionLog(log));
    } catch (error) {
      throw new HttpException(
        `Failed to get session logs: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  @Get('recent')
  async getRecentSessionLogs(
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ): Promise<any[]> {
    try {
      const sessionLogs = await this.sessionLogsGetRecent.run(limit || 100);
      return sessionLogs.map((log) => this.serializeSessionLog(log));
    } catch (error) {
      throw new HttpException(
        `Failed to get recent session logs: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  @Get('session/:sessionId')
  async getSessionLogsBySessionId(
    @Param('sessionId') sessionId: string,
  ): Promise<any[]> {
    try {
      // Validate UUID format for sessionId
      const uuidPattern =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidPattern.test(sessionId)) {
        throw new HttpException(`Session not found`, HttpStatus.NOT_FOUND);
      }
      const sessionLogs = await this.sessionLogsGetBySessionId.run(sessionId);
      return sessionLogs.map((log) => this.serializeSessionLog(log));
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Failed to get session logs for session ${sessionId}: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  @Get('session/:sessionId/type/:logType')
  async getSessionLogsBySessionIdAndType(
    @Param('sessionId') sessionId: string,
    @Param('logType') logType: string,
  ): Promise<any[]> {
    try {
      const sessionLogs = await this.sessionLogsGetBySessionIdAndType.run(
        sessionId,
        logType,
      );
      return sessionLogs.map((log) => this.serializeSessionLog(log));
    } catch (error) {
      throw new HttpException(
        `Failed to get session logs for session ${sessionId} and type ${logType}: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  @Get(':id')
  async getSessionLogById(@Param('id') id: string): Promise<any | null> {
    try {
      // Validate UUID format
      const uuidPattern =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidPattern.test(id)) {
        throw new HttpException(`Session log not found`, HttpStatus.NOT_FOUND);
      }
      const sessionLog = await this.sessionLogsGetOneById.run(id);
      if (!sessionLog) {
        throw new HttpException(
          `Session log with id ${id} not found`,
          HttpStatus.NOT_FOUND,
        );
      }
      return this.serializeSessionLog(sessionLog);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Failed to get session log: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  @Delete(':id')
  async deleteSessionLog(
    @Param('id') id: string,
  ): Promise<{ message: string }> {
    try {
      // Validate UUID format
      const uuidPattern =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidPattern.test(id)) {
        throw new HttpException(`Session log not found`, HttpStatus.NOT_FOUND);
      }

      await this.sessionLogsDelete.run(id);
      return { message: `Session log ${id} deleted successfully` };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      if (error.message && error.message.includes('not found')) {
        throw new HttpException(
          `Session log with id ${id} not found`,
          HttpStatus.NOT_FOUND,
        );
      }
      throw new HttpException(
        `Failed to delete session log: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  @Delete('session/:sessionId')
  async deleteSessionLogsBySessionId(
    @Param('sessionId') sessionId: string,
  ): Promise<{ message: string }> {
    try {
      // Validate UUID format for sessionId
      const uuidPattern =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidPattern.test(sessionId)) {
        throw new HttpException(`Session not found`, HttpStatus.NOT_FOUND);
      }

      await this.sessionLogsDeleteBySessionId.run(sessionId);
      return {
        message: `All session logs for session ${sessionId} deleted successfully`,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Failed to delete session logs for session ${sessionId}: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  @Delete('cleanup/old')
  async cleanupOldSessionLogs(
    @Query('days') daysParam?: string,
  ): Promise<{ message: string; deletedCount: number }> {
    try {
      let days = 30; // default

      if (daysParam !== undefined) {
        days = parseInt(daysParam, 10);
        if (isNaN(days) || days < 1) {
          throw new HttpException(
            'Invalid days parameter. Must be a positive integer.',
            HttpStatus.BAD_REQUEST,
          );
        }
      }

      const deletedCount = await this.sessionLogsCleanup.run(days);
      return {
        message: `Cleanup completed successfully`,
        deletedCount,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Failed to cleanup old session logs: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
