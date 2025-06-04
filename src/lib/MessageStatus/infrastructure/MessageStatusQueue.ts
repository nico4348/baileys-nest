import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

export interface MessageStatusUpdateJob {
  messageId: string;
  statusId: string;
  sessionId: string;
  timestamp: Date;
  priority?: 'high' | 'normal' | 'low';
  baileysMessageId?: string;
  previousStatus?: string;
  newStatus?: string;
  metadata?: Record<string, any>;
}

export interface BatchStatusUpdateJob {
  updates: MessageStatusUpdateJob[];
  batchId: string;
}

@Injectable()
export class MessageStatusQueue {
  constructor(
    @InjectQueue('message-status-updates') 
    private readonly statusQueue: Queue,
  ) {}

  async addStatusUpdate(job: MessageStatusUpdateJob): Promise<void> {
    const priority = this.getPriorityValue(job.priority || 'normal');
    
    await this.statusQueue.add('update-status', job, {
      priority,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
      removeOnComplete: 100,
      removeOnFail: 50,
      jobId: `status_${job.messageId}_${Date.now()}`,
    });
  }

  private getPriorityValue(priority: 'high' | 'normal' | 'low'): number {
    switch (priority) {
      case 'high': return 1;
      case 'normal': return 5;
      case 'low': return 10;
      default: return 5;
    }
  }

  async addBatchStatusUpdate(jobs: MessageStatusUpdateJob[]): Promise<void> {
    const batchJob: BatchStatusUpdateJob = {
      updates: jobs,
      batchId: `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    await this.statusQueue.add('batch-update-status', batchJob, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      priority: 10, // Higher priority for batch operations
      removeOnComplete: 50,
      removeOnFail: 25,
    });
  }

  async addDelayedStatusUpdate(
    job: MessageStatusUpdateJob, 
    delayMs: number
  ): Promise<void> {
    await this.statusQueue.add('update-status', job, {
      delay: delayMs,
      attempts: 3,
      removeOnComplete: 100,
      removeOnFail: 50,
    });
  }
}