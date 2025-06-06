import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { Queue } from 'bullmq';
import Redis from 'ioredis';
import { OutgoingQueueManager } from './OutgoingQueueManager';
import { OutgoingSessionProcessor } from './OutgoingSessionProcessor';

@Injectable()
export class QueueRecoveryService implements OnApplicationBootstrap {
  private readonly logger = new Logger(QueueRecoveryService.name);
  private readonly redis: Redis;

  constructor(
    private readonly queueManager: OutgoingQueueManager,
    private readonly sessionProcessor: OutgoingSessionProcessor,
  ) {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      username: process.env.REDIS_USERNAME || 'default',
      password: process.env.REDIS_PASSWORD,
      maxRetriesPerRequest: null,
    });
  }

  async onApplicationBootstrap() {
    this.logger.log('Starting queue recovery process...');
    
    try {
      await this.recoverExistingQueues();
      this.logger.log('Queue recovery completed successfully');
    } catch (error) {
      this.logger.error('Queue recovery failed:', error);
    }
  }

  private async recoverExistingQueues(): Promise<void> {
    const existingQueueNames = await this.discoverExistingQueues();
    
    if (existingQueueNames.length === 0) {
      this.logger.log('No existing queues found in Redis');
      return;
    }

    this.logger.log(`Found ${existingQueueNames.length} existing queues in Redis`);

    const recoveryPromises = existingQueueNames.map(queueName => 
      this.recoverQueue(queueName)
    );

    await Promise.all(recoveryPromises);
  }

  private async discoverExistingQueues(): Promise<string[]> {
    try {
      const keys = await this.redis.keys('bull:outgoing-messages-*:id');
      
      const queueNames = keys
        .map(key => {
          const match = key.match(/bull:(outgoing-messages-[^:]+):/);
          return match ? match[1] : null;
        })
        .filter((name): name is string => name !== null);

      const uniqueQueueNames = Array.from(new Set(queueNames));
      
      this.logger.debug(`Discovered queue keys: ${keys.length}, unique queues: ${uniqueQueueNames.length}`);
      
      return uniqueQueueNames;
    } catch (error) {
      this.logger.error('Failed to discover existing queues:', error);
      return [];
    }
  }

  private async recoverQueue(queueName: string): Promise<void> {
    try {
      const sessionId = this.extractSessionIdFromQueueName(queueName);
      if (!sessionId) {
        this.logger.warn(`Could not extract session ID from queue name: ${queueName}`);
        return;
      }

      const hasJobs = await this.checkQueueHasJobs(queueName);
      
      if (!hasJobs) {
        this.logger.debug(`Queue ${queueName} has no pending jobs, skipping recovery`);
        return;
      }

      this.logger.log(`Recovering queue ${queueName} for session ${sessionId}`);

      await this.restoreSessionQueue(sessionId, queueName);
      await this.restoreSessionWorker(sessionId);

      this.logger.log(`Successfully recovered queue ${queueName}`);
    } catch (error) {
      this.logger.error(`Failed to recover queue ${queueName}:`, error);
    }
  }

  private extractSessionIdFromQueueName(queueName: string): string | null {
    const match = queueName.match(/^outgoing-messages-(.+)$/);
    return match ? match[1] : null;
  }

  private async checkQueueHasJobs(queueName: string): Promise<boolean> {
    try {
      const tempQueue = new Queue(queueName, {
        connection: this.redis,
      });

      const [waiting, active, delayed] = await Promise.all([
        tempQueue.getWaiting(),
        tempQueue.getActive(),
        tempQueue.getDelayed(),
      ]);

      const hasJobs = waiting.length > 0 || active.length > 0 || delayed.length > 0;
      
      await tempQueue.close();
      
      this.logger.debug(`Queue ${queueName} job counts - waiting: ${waiting.length}, active: ${active.length}, delayed: ${delayed.length}`);
      
      return hasJobs;
    } catch (error) {
      this.logger.error(`Failed to check jobs for queue ${queueName}:`, error);
      return false;
    }
  }

  private async restoreSessionQueue(sessionId: string, queueName: string): Promise<void> {
    const existingQueue = this.queueManager['queues'].get(sessionId);
    
    if (existingQueue) {
      this.logger.debug(`Queue for session ${sessionId} already exists in memory`);
      return;
    }

    const queue = new Queue(queueName, this.queueManager['queueOptions']);
    this.queueManager['queues'].set(sessionId, queue);

    const isPaused = await queue.isPaused();
    if (isPaused) {
      await queue.resume();
      this.logger.log(`Resumed recovered queue ${queueName}`);
    }

    queue.on('error', (error) => {
      this.logger.error(`Queue error for recovered session ${sessionId}:`, error);
    });

    this.logger.debug(`Restored queue ${queueName} to OutgoingQueueManager`);
  }

  private async restoreSessionWorker(sessionId: string): Promise<void> {
    try {
      const existingWorker = this.sessionProcessor['sessionWorkers'].get(sessionId);
      
      if (existingWorker) {
        this.logger.debug(`Worker for session ${sessionId} already exists`);
        return;
      }

      await this.sessionProcessor.ensureSessionWorker(sessionId);
      this.logger.log(`Restored worker for session ${sessionId}`);
    } catch (error) {
      this.logger.error(`Failed to restore worker for session ${sessionId}:`, error);
    }
  }

  async getRecoveryStats(): Promise<{
    totalQueuesDiscovered: number;
    queuesWithJobs: number;
    recoveredQueues: number;
    errors: number;
  }> {
    try {
      const existingQueueNames = await this.discoverExistingQueues();
      let queuesWithJobs = 0;
      let recoveredQueues = 0;

      for (const queueName of existingQueueNames) {
        const hasJobs = await this.checkQueueHasJobs(queueName);
        if (hasJobs) {
          queuesWithJobs++;
          const sessionId = this.extractSessionIdFromQueueName(queueName);
          if (sessionId && this.queueManager.getActiveSessionIds().includes(sessionId)) {
            recoveredQueues++;
          }
        }
      }

      return {
        totalQueuesDiscovered: existingQueueNames.length,
        queuesWithJobs,
        recoveredQueues,
        errors: 0,
      };
    } catch (error) {
      this.logger.error('Failed to get recovery stats:', error);
      return {
        totalQueuesDiscovered: 0,
        queuesWithJobs: 0,
        recoveredQueues: 0,
        errors: 1,
      };
    }
  }
}