import { Controller, Get, Post, Param, Body, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { SessionRateLimiter } from '../infrastructure/SessionRateLimiter';
import { OutgoingMessageQueue } from '../infrastructure/OutgoingMessageQueue';

interface UpdateRateLimitRequest {
  limit: number;
}

interface RateLimitStatsResponse {
  sessionId: string;
  current: number;
  limit: number;
  remaining: number;
  resetTime: number;
  percentage: number;
}

interface QueueStatsResponse {
  sessionId: string;
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
  paused: boolean;
}

@Controller('sessions/:sessionId/rate-limit')
export class RateLimitingController {
  private readonly logger = new Logger(RateLimitingController.name);

  constructor(
    private readonly sessionRateLimiter: SessionRateLimiter,
    private readonly outgoingMessageQueue: OutgoingMessageQueue,
  ) {}

  @Get('stats')
  async getRateLimitStats(@Param('sessionId') sessionId: string): Promise<RateLimitStatsResponse> {
    try {
      const stats = await this.sessionRateLimiter.getRateLimitStats(sessionId);
      return {
        sessionId,
        ...stats,
      };
    } catch (error) {
      this.logger.error(`Error getting rate limit stats for session ${sessionId}:`, error);
      throw new HttpException(
        'Failed to get rate limit statistics',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('update')
  async updateRateLimit(
    @Param('sessionId') sessionId: string,
    @Body() request: UpdateRateLimitRequest,
  ): Promise<{ success: boolean; message: string }> {
    try {
      if (!request.limit || request.limit < 1 || request.limit > 1000) {
        throw new HttpException(
          'Rate limit must be between 1 and 1000 messages per minute',
          HttpStatus.BAD_REQUEST,
        );
      }

      await this.sessionRateLimiter.setSessionLimit(sessionId, request.limit);
      
      this.logger.log(`Updated rate limit for session ${sessionId} to ${request.limit}`);
      
      return {
        success: true,
        message: `Rate limit updated to ${request.limit} messages per minute`,
      };
    } catch (error) {
      this.logger.error(`Error updating rate limit for session ${sessionId}:`, error);
      
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        'Failed to update rate limit',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('reset')
  async resetRateLimit(@Param('sessionId') sessionId: string): Promise<{ success: boolean; message: string }> {
    try {
      await this.sessionRateLimiter.reset(sessionId);
      
      this.logger.log(`Reset rate limit counter for session ${sessionId}`);
      
      return {
        success: true,
        message: 'Rate limit counter reset successfully',
      };
    } catch (error) {
      this.logger.error(`Error resetting rate limit for session ${sessionId}:`, error);
      throw new HttpException(
        'Failed to reset rate limit',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('queue/stats')
  async getQueueStats(@Param('sessionId') sessionId: string): Promise<QueueStatsResponse> {
    try {
      const stats = await this.outgoingMessageQueue.getSessionStats(sessionId);
      return {
        sessionId,
        ...stats,
      };
    } catch (error) {
      this.logger.error(`Error getting queue stats for session ${sessionId}:`, error);
      throw new HttpException(
        'Failed to get queue statistics',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('queue/pause')
  async pauseQueue(@Param('sessionId') sessionId: string): Promise<{ success: boolean; message: string }> {
    try {
      await this.outgoingMessageQueue.pauseSession(sessionId);
      
      this.logger.log(`Paused queue for session ${sessionId}`);
      
      return {
        success: true,
        message: 'Queue paused successfully',
      };
    } catch (error) {
      this.logger.error(`Error pausing queue for session ${sessionId}:`, error);
      throw new HttpException(
        'Failed to pause queue',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('queue/resume')
  async resumeQueue(@Param('sessionId') sessionId: string): Promise<{ success: boolean; message: string }> {
    try {
      await this.outgoingMessageQueue.resumeSession(sessionId);
      
      this.logger.log(`Resumed queue for session ${sessionId}`);
      
      return {
        success: true,
        message: 'Queue resumed successfully',
      };
    } catch (error) {
      this.logger.error(`Error resuming queue for session ${sessionId}:`, error);
      throw new HttpException(
        'Failed to resume queue',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

@Controller('rate-limiting')
export class GlobalRateLimitingController {
  private readonly logger = new Logger(GlobalRateLimitingController.name);

  constructor(
    private readonly outgoingMessageQueue: OutgoingMessageQueue,
  ) {}

  @Get('sessions')
  async getAllSessions(): Promise<{
    activeSessions: string[];
    queueCount: number;
  }> {
    try {
      const activeSessions = this.outgoingMessageQueue.getActiveSessions();
      return {
        activeSessions,
        queueCount: activeSessions.length,
      };
    } catch (error) {
      this.logger.error('Error getting active sessions:', error);
      throw new HttpException(
        'Failed to get active sessions',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('stats')
  async getAllStats(): Promise<Record<string, QueueStatsResponse>> {
    try {
      const allStats = await this.outgoingMessageQueue.getQueueStats();
      
      // Transform to include sessionId in each stat object
      const result: Record<string, QueueStatsResponse> = {};
      
      for (const [sessionId, stats] of Object.entries(allStats)) {
        result[sessionId] = {
          sessionId,
          ...stats,
        };
      }
      
      return result;
    } catch (error) {
      this.logger.error('Error getting all queue stats:', error);
      throw new HttpException(
        'Failed to get queue statistics',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('cleanup')
  async cleanupInactiveSessions(): Promise<{ success: boolean; message: string }> {
    try {
      const inactiveHours = parseInt(process.env.SESSION_QUEUE_CLEANUP_HOURS || '24');
      await this.outgoingMessageQueue.cleanupInactiveSessions(inactiveHours);
      
      this.logger.log('Cleaned up inactive session queues');
      
      return {
        success: true,
        message: `Cleanup completed for sessions inactive for more than ${inactiveHours} hours`,
      };
    } catch (error) {
      this.logger.error('Error cleaning up inactive sessions:', error);
      throw new HttpException(
        'Failed to cleanup inactive sessions',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}