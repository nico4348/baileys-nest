import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { Queue, QueueOptions } from 'bullmq';
import { OutgoingMessageJob, BulkOutgoingMessageJob } from './OutgoingMessageQueue';
import Redis from 'ioredis';

export interface SessionQueueConfig {
  sessionId: string;
  concurrency?: number;
  enabled?: boolean;
}

@Injectable()
export class OutgoingQueueManager implements OnModuleDestroy {
  private readonly logger = new Logger(OutgoingQueueManager.name);
  private readonly redis: Redis;
  private readonly queues = new Map<string, Queue>();
  private readonly queueOptions: QueueOptions;

  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      username: process.env.REDIS_USERNAME || 'default',
      password: process.env.REDIS_PASSWORD,
      maxRetriesPerRequest: null,
    });

    this.queueOptions = {
      connection: this.redis,
      defaultJobOptions: {
        removeOnComplete: 200,
        removeOnFail: 100,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
      },
    };
  }

  async enqueue(sessionId: string, job: OutgoingMessageJob): Promise<void> {
    const queue = await this.getOrCreateQueue(sessionId);
    const priority = this.getPriorityValue(job.priority);
    const delay = job.scheduledAt ? 
      Math.max(0, job.scheduledAt.getTime() - Date.now()) : 0;

    await queue.add('send-message', job, {
      priority,
      delay,
      attempts: job.retryCount || 3,
      jobId: `${sessionId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    });

    this.logger.debug(`Message enqueued for session ${sessionId}: ${job.messageType}`);
  }

  async enqueueBulk(sessionId: string, job: BulkOutgoingMessageJob): Promise<void> {
    const queue = await this.getOrCreateQueue(sessionId);

    await queue.add('send-bulk-messages', job, {
      priority: 5,
      attempts: 2,
      backoff: {
        type: 'fixed',
        delay: 10000,
      },
    });

    this.logger.debug(`Bulk messages enqueued for session ${sessionId}: ${job.messages.length} messages`);
  }

  async enqueueHighPriority(sessionId: string, job: OutgoingMessageJob): Promise<void> {
    const queue = await this.getOrCreateQueue(sessionId);

    await queue.add('send-message', { ...job, priority: 'high' }, {
      priority: 10,
      attempts: 5,
      backoff: {
        type: 'exponential',
        delay: 3000,
      },
    });

    this.logger.debug(`High priority message enqueued for session ${sessionId}: ${job.messageType}`);
  }

  async pauseSession(sessionId: string): Promise<void> {
    const queue = this.queues.get(sessionId);
    if (queue) {
      await queue.pause();
      this.logger.log(`Paused queue for session ${sessionId}`);
    }
  }

  async resumeSession(sessionId: string): Promise<void> {
    const queue = this.queues.get(sessionId);
    if (queue) {
      await queue.resume();
      this.logger.log(`Resumed queue for session ${sessionId}`);
    }
  }

  async drainSession(sessionId: string): Promise<void> {
    const queue = this.queues.get(sessionId);
    if (queue) {
      await queue.drain();
      this.logger.log(`Drained queue for session ${sessionId}`);
    }
  }

  async getSessionQueueStats(sessionId: string) {
    const queue = this.queues.get(sessionId);
    if (!queue) {
      return {
        waiting: 0,
        active: 0,
        completed: 0,
        failed: 0,
        delayed: 0,
        paused: false,
      };
    }

    const [waiting, active, completed, failed, delayed] = await Promise.all([
      queue.getWaiting(),
      queue.getActive(),
      queue.getCompleted(),
      queue.getFailed(),
      queue.getDelayed(),
    ]);

    return {
      waiting: waiting.length,
      active: active.length,
      completed: completed.length,
      failed: failed.length,
      delayed: delayed.length,
      paused: await queue.isPaused(),
    };
  }

  async getAllSessionsStats() {
    const stats = new Map<string, any>();
    
    for (const [sessionId, queue] of this.queues) {
      stats.set(sessionId, await this.getSessionQueueStats(sessionId));
    }
    
    return Object.fromEntries(stats);
  }

  async removeSessionQueue(sessionId: string): Promise<void> {
    const queue = this.queues.get(sessionId);
    if (queue) {
      await queue.close();
      this.queues.delete(sessionId);
      this.logger.log(`Removed queue for session ${sessionId}`);
    }
  }

  async cleanupInactiveSessions(inactiveThresholdHours: number = 24): Promise<void> {
    const cutoffTime = Date.now() - (inactiveThresholdHours * 60 * 60 * 1000);
    const sessionsToCleanup: string[] = [];

    for (const [sessionId, queue] of this.queues) {
      const stats = await this.getSessionQueueStats(sessionId);
      
      // If no activity and no pending jobs, mark for cleanup
      if (stats.waiting === 0 && stats.active === 0 && stats.delayed === 0) {
        const completed = await queue.getCompleted();
        const lastJobTime = completed.length > 0 ? 
          Math.max(...completed.map(job => job.timestamp)) : 0;
        
        if (lastJobTime < cutoffTime) {
          sessionsToCleanup.push(sessionId);
        }
      }
    }

    for (const sessionId of sessionsToCleanup) {
      await this.removeSessionQueue(sessionId);
    }

    if (sessionsToCleanup.length > 0) {
      this.logger.log(`Cleaned up ${sessionsToCleanup.length} inactive session queues`);
    }
  }

  getActiveSessionIds(): string[] {
    return Array.from(this.queues.keys());
  }

  getQueueCount(): number {
    return this.queues.size;
  }

  private async getOrCreateQueue(sessionId: string): Promise<Queue> {
    let queue = this.queues.get(sessionId);
    
    if (!queue) {
      const queueName = `outgoing-messages-${sessionId}`;
      queue = new Queue(queueName, this.queueOptions);
      
      this.queues.set(sessionId, queue);
      this.logger.debug(`Created new queue: ${queueName}`);
      
      // Ensure new queues start in resumed state
      const isPaused = await queue.isPaused();
      if (isPaused) {
        await queue.resume();
        this.logger.debug(`Auto-resumed queue ${queueName} after creation`);
      }
      
      // Setup error handling for the queue
      queue.on('error', (error) => {
        this.logger.error(`Queue error for session ${sessionId}:`, error);
      });
    }
    
    return queue;
  }

  private getPriorityValue(priority: string): number {
    switch (priority) {
      case 'high': return 10;
      case 'normal': return 5;
      case 'low': return 1;
      default: return 5;
    }
  }

  async onModuleDestroy() {
    this.logger.log('Closing all session queues...');
    
    const closePromises = Array.from(this.queues.values()).map(queue => queue.close());
    await Promise.all(closePromises);
    
    this.queues.clear();
    await this.redis.disconnect();
    
    this.logger.log('All session queues closed');
  }
}