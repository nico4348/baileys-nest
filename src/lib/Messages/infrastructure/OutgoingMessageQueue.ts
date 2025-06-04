import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

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
  constructor(
    @InjectQueue('outgoing-messages') 
    private readonly outgoingQueue: Queue,
  ) {}

  async addMessage(job: OutgoingMessageJob): Promise<void> {
    const priority = this.getPriorityValue(job.priority);
    const delay = job.scheduledAt ? 
      Math.max(0, job.scheduledAt.getTime() - Date.now()) : 0;

    await this.outgoingQueue.add('send-message', job, {
      priority,
      delay,
      attempts: job.retryCount || 3,
      backoff: {
        type: 'exponential',
        delay: 5000, // Start with 5 seconds
      },
      removeOnComplete: 200,
      removeOnFail: 100,
      // Rate limiting: max 1 message per session every 2 seconds
      jobId: `session_${job.sessionId}_${Date.now()}`,
    });
  }

  async addBulkMessages(job: BulkOutgoingMessageJob): Promise<void> {
    await this.outgoingQueue.add('send-bulk-messages', job, {
      priority: 5, // Medium priority for bulk operations
      attempts: 2, // Less retries for bulk operations
      backoff: {
        type: 'fixed',
        delay: 10000,
      },
      removeOnComplete: 50,
      removeOnFail: 25,
    });
  }

  async addHighPriorityMessage(job: OutgoingMessageJob): Promise<void> {
    await this.outgoingQueue.add('send-message', { ...job, priority: 'high' }, {
      priority: 10, // Highest priority
      attempts: 5, // More retries for high priority
      backoff: {
        type: 'exponential',
        delay: 3000,
      },
      removeOnComplete: 500,
      removeOnFail: 200,
    });
  }

  async getQueueStats() {
    return {
      waiting: await this.outgoingQueue.getWaiting(),
      active: await this.outgoingQueue.getActive(),
      completed: await this.outgoingQueue.getCompleted(),
      failed: await this.outgoingQueue.getFailed(),
      delayed: await this.outgoingQueue.getDelayed(),
    };
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