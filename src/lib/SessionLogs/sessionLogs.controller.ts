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

  @Get()
  async getAllSessionLogs(): Promise<SessionLog[]> {
    try {
      return await this.sessionLogsGetAll.run();
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
  ): Promise<SessionLog[]> {
    try {
      return await this.sessionLogsGetRecent.run(limit || 100);
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
  ): Promise<SessionLog[]> {
    try {
      return await this.sessionLogsGetBySessionId.run(sessionId);
    } catch (error) {
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
  ): Promise<SessionLog[]> {
    try {
      return await this.sessionLogsGetBySessionIdAndType.run(sessionId, logType);
    } catch (error) {
      throw new HttpException(
        `Failed to get session logs for session ${sessionId} and type ${logType}: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get(':id')
  async getSessionLogById(@Param('id') id: string): Promise<SessionLog | null> {
    try {
      const sessionLog = await this.sessionLogsGetOneById.run(id);
      if (!sessionLog) {
        throw new HttpException(
          `Session log with id ${id} not found`,
          HttpStatus.NOT_FOUND,
        );
      }
      return sessionLog;
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
  async deleteSessionLog(@Param('id') id: string): Promise<{ message: string }> {
    try {
      await this.sessionLogsDelete.run(id);
      return { message: `Session log ${id} deleted successfully` };
    } catch (error) {
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
      await this.sessionLogsDeleteBySessionId.run(sessionId);
      return { message: `All session logs for session ${sessionId} deleted successfully` };
    } catch (error) {
      throw new HttpException(
        `Failed to delete session logs for session ${sessionId}: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('cleanup/old')
  async cleanupOldSessionLogs(
    @Query('days', new ParseIntPipe({ optional: true })) days?: number,
  ): Promise<{ message: string; deletedCount: number }> {
    try {
      const deletedCount = await this.sessionLogsCleanup.run(days || 30);
      return {
        message: `Cleanup completed successfully`,
        deletedCount,
      };
    } catch (error) {
      throw new HttpException(
        `Failed to cleanup old session logs: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}