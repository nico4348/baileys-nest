import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

export interface IncomingMessageJob {
  sessionId: string;
  messageData: {
    baileysId: string;
    from: string;
    to: string;
    messageType: string;
    baileysJson: any;
    quotedMessageId?: string;
    timestamp: Date;
  };
  messageContent?: {
    text?: string;
    mediaUrl?: string;
    mediaType?: string;
    fileName?: string;
    caption?: string;
    emoji?: string;
    targetMessageId?: string;
  };
  priority: 'high' | 'normal' | 'low';
  processingFlags: {
    needsMediaDownload: boolean;
    needsS3Upload: boolean;
    isGroupMessage: boolean;
    requiresNotification: boolean;
  };
}

export interface BulkIncomingMessageJob {
  sessionId: string;
  messages: Omit<IncomingMessageJob, 'sessionId'>[];
  batchId: string;
  receivedAt: Date;
}

@Injectable()
export class IncomingMessageQueue {
  constructor(
    @InjectQueue('incoming-messages') 
    private readonly incomingQueue: Queue,
  ) {}

  async addIncomingMessage(job: IncomingMessageJob): Promise<void> {
    const priority = this.getPriorityValue(job.priority);

    await this.incomingQueue.add('process-incoming', job, {
      priority,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: 300,
      removeOnFail: 100,
      // Use baileys message ID to prevent duplicates
      jobId: `incoming_${job.sessionId}_${job.messageData.baileysId}`,
    });
  }

  async addBulkIncomingMessages(job: BulkIncomingMessageJob): Promise<void> {
    await this.incomingQueue.add('process-bulk-incoming', job, {
      priority: 7, // High priority for bulk processing
      attempts: 2,
      backoff: {
        type: 'fixed',
        delay: 5000,
      },
      removeOnComplete: 100,
      removeOnFail: 50,
    });
  }

  async addHighPriorityIncoming(job: IncomingMessageJob): Promise<void> {
    await this.incomingQueue.add('process-incoming', { ...job, priority: 'high' }, {
      priority: 10, // Highest priority
      attempts: 5,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
      removeOnComplete: 500,
      removeOnFail: 200,
    });
  }

  async addMediaProcessing(job: IncomingMessageJob): Promise<void> {
    // Special queue handling for media messages that need download/upload
    await this.incomingQueue.add('process-media-incoming', job, {
      priority: 8, // High priority for media
      attempts: 4, // More retries for media processing
      backoff: {
        type: 'exponential',
        delay: 3000,
      },
      removeOnComplete: 200,
      removeOnFail: 100,
      // Longer timeout for media processing
      delay: 100, // Small delay to allow for proper processing order
    });
  }

  async getQueueStats() {
    return {
      waiting: await this.incomingQueue.getWaiting(),
      active: await this.incomingQueue.getActive(),
      completed: await this.incomingQueue.getCompleted(),
      failed: await this.incomingQueue.getFailed(),
      delayed: await this.incomingQueue.getDelayed(),
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