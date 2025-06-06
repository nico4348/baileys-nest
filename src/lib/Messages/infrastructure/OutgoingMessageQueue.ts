import { Injectable, Logger, Inject } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { OutgoingQueueManager } from './OutgoingQueueManager';
import { OutgoingSessionProcessor } from './OutgoingSessionProcessor';
import { SessionsGetOneById } from '../../Sessions/application/SessionsGetOneById';

export interface OutgoingMessageJob {
  sessionId: string;
  messageType: 'text' | 'media' | 'reaction';
  messageData: {
    to: string;
    content: string | Buffer;
    quotedMessageId?: string;
    mediaType?: string;
    fileName?: string;
    caption?: string;
    emoji?: string;
    targetMessageId?: string;
  };
  priority: 'high' | 'normal' | 'low';
  retryCount?: number;
  scheduledAt?: Date;
}

export interface BulkOutgoingMessageJob {
  sessionId: string;
  messages: Omit<OutgoingMessageJob, 'sessionId'>[];
  batchId: string;
  delayBetweenMessages?: number; // ms delay between messages
}

@Injectable()
export class OutgoingMessageQueue {
  private readonly logger = new Logger(OutgoingMessageQueue.name);

  constructor(
    @InjectQueue('outgoing-messages') 
    private readonly outgoingQueue: Queue,
    private readonly queueManager: OutgoingQueueManager,
    private readonly sessionProcessor: OutgoingSessionProcessor,
    @Inject('SessionsGetOneById')
    private readonly sessionsGetOneById: SessionsGetOneById,
  ) {}

  async addMessage(job: OutgoingMessageJob): Promise<void> {
    // Validate session is active
    await this.validateSessionIsActive(job.sessionId);
    
    // Ensure session worker exists
    await this.ensureSessionWorker(job.sessionId);
    
    // Use the new queue manager
    await this.queueManager.enqueue(job.sessionId, job);
  }

  async addBulkMessages(job: BulkOutgoingMessageJob): Promise<void> {
    // Validate session is active
    await this.validateSessionIsActive(job.sessionId);
    
    // Ensure session worker exists
    await this.ensureSessionWorker(job.sessionId);
    
    // Use the new queue manager
    await this.queueManager.enqueueBulk(job.sessionId, job);
  }

  async addHighPriorityMessage(job: OutgoingMessageJob): Promise<void> {
    // Validate session is active
    await this.validateSessionIsActive(job.sessionId);
    
    // Ensure session worker exists
    await this.ensureSessionWorker(job.sessionId);
    
    // Use the new queue manager for high priority
    await this.queueManager.enqueueHighPriority(job.sessionId, job);
  }

  async getQueueStats() {
    // Return aggregated stats from all session queues
    return await this.queueManager.getAllSessionsStats();
  }

  async getSessionStats(sessionId: string) {
    return await this.queueManager.getSessionQueueStats(sessionId);
  }

  async pauseSession(sessionId: string): Promise<void> {
    await this.queueManager.pauseSession(sessionId);
  }

  async resumeSession(sessionId: string): Promise<void> {
    await this.queueManager.resumeSession(sessionId);
  }

  async removeSession(sessionId: string): Promise<void> {
    await this.sessionProcessor.removeSessionWorker(sessionId);
    await this.queueManager.removeSessionQueue(sessionId);
  }

  async cleanupInactiveSessions(inactiveThresholdHours: number = 24): Promise<void> {
    await this.queueManager.cleanupInactiveSessions(inactiveThresholdHours);
  }

  getActiveSessions(): string[] {
    return this.queueManager.getActiveSessionIds();
  }

  async ensureSessionWorker(sessionId: string): Promise<void> {
    const activeWorkers = this.sessionProcessor.getActiveSessionWorkers();
    
    if (!activeWorkers.includes(sessionId)) {
      this.logger.debug(`Creating worker for session ${sessionId}`);
      try {
        await this.sessionProcessor.createSessionWorker(sessionId);
      } catch (error) {
        this.logger.error(`Failed to create worker for session ${sessionId}: ${error.message}`);
        throw error;
      }
    }
  }

  private async validateSessionIsActive(sessionId: string): Promise<void> {
    try {
      const session = await this.sessionsGetOneById.run(sessionId);
      
      if (!session) {
        throw new Error(`Session ${sessionId} not found`);
      }

      if (!session.status || session.status.value === false) {
        throw new Error(`Session ${sessionId} is not online - cannot send messages`);
      }

      this.logger.debug(`Session ${sessionId} validation passed - status: ${session.status.value}`);
    } catch (error) {
      this.logger.warn(`Session validation failed for ${sessionId}: ${error.message}`);
      throw error;
    }
  }

  private getPriorityValue(priority: string): number {
    switch (priority) {
      case 'high': return 10;
      case 'normal': return 5;
      case 'low': return 1;
      default: return 5;
    }
  }
}