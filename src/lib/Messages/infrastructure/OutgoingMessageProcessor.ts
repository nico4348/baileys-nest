import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Inject, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { OutgoingMessageJob, BulkOutgoingMessageJob } from './OutgoingMessageQueue';
import Redis from 'ioredis';

@Processor('outgoing-messages')
export class OutgoingMessageProcessor extends WorkerHost {
  private readonly logger = new Logger(OutgoingMessageProcessor.name);
  private readonly redis: Redis;

  constructor(
    @Inject('MessagesOrchestrator')
    private readonly messagesOrchestrator: any,
  ) {
    super();
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      username: process.env.REDIS_USERNAME || 'default',
      password: process.env.REDIS_PASSWORD,
    });
  }

  @OnWorkerEvent('active')
  onActive(job: Job) {
    this.logger.debug(`Processing outgoing message for session ${job.data.sessionId}`);
  }

  @OnWorkerEvent('completed')
  onComplete(job: Job) {
    this.logger.debug(`Completed outgoing message`);
  }

  @OnWorkerEvent('failed')
  onError(job: Job, error: any) {
    this.logger.error(`Failed outgoing message: ${error.message}`);
  }

  async process(job: Job<OutgoingMessageJob | BulkOutgoingMessageJob>): Promise<void> {
    try {
      if (job.name === 'send-message') {
        await this.processSingleMessage(job as Job<OutgoingMessageJob>);
      } else if (job.name === 'send-bulk-messages') {
        await this.processBulkMessages(job as Job<BulkOutgoingMessageJob>);
      }
    } catch (error) {
      this.logger.error(`Error processing outgoing message: ${error.message}`);
      throw error;
    }
  }

  private async processSingleMessage(job: Job<OutgoingMessageJob>): Promise<void> {
    const { sessionId, messageType, messageData } = job.data;

    // Rate limiting check
    await this.checkRateLimit(sessionId);

    try {
      let result;
      
      // Mock result for now - actual sending will be implemented later
      result = { messageId: `mock_${Date.now()}`, success: true };
      this.logger.debug(`Processed ${messageType} message for ${sessionId}`);
      
      // Update rate limiting counter
      await this.updateRateLimit(sessionId);
      
      return result;
    } catch (error) {
      this.logger.error(`Failed to send ${messageType} message for session ${sessionId}: ${error.message}`);
      throw error;
    }
  }

  private async processBulkMessages(job: Job<BulkOutgoingMessageJob>): Promise<void> {
    const { sessionId, messages, batchId, delayBetweenMessages = 2000 } = job.data;
    
    this.logger.log(`Processing bulk messages batch ${batchId} with ${messages.length} messages`);

    const results: Array<{index: number, status: string, result?: any, error?: string}> = [];
    
    for (let i = 0; i < messages.length; i++) {
      const messageJob = messages[i];
      
      try {
        // Rate limiting check before each message
        await this.checkRateLimit(sessionId);
        
        const result = await this.processSingleMessage({
          data: {
            sessionId,
            ...messageJob,
          }
        } as Job<OutgoingMessageJob>);
        
        results.push({ index: i, status: 'success', result });
        
        // Update rate limit
        await this.updateRateLimit(sessionId);
        
        // Delay between messages (except for the last one)
        if (i < messages.length - 1) {
          await this.delay(delayBetweenMessages);
        }
        
      } catch (error) {
        this.logger.error(`Failed to send message ${i} in batch ${batchId}: ${error.message}`);
        results.push({ index: i, status: 'failed', error: error.message });
        
        // Continue with next message even if one fails
        await this.delay(delayBetweenMessages);
      }
    }

    const failures = results.filter(r => r.status === 'failed');
    const successes = results.filter(r => r.status === 'success');

    this.logger.log(
      `Bulk batch ${batchId} completed: ${successes.length} successes, ${failures.length} failures`
    );

    if (failures.length > messages.length * 0.7) {
      throw new Error(`Bulk batch ${batchId} failed: too many failures (${failures.length}/${messages.length})`);
    }
  }

  private async checkRateLimit(sessionId: string): Promise<void> {
    const key = `rate_limit:outgoing:${sessionId}`;
    const current = await this.redis.get(key);
    const limit = 30; // 30 messages per minute
    const window = 60; // 60 seconds

    if (current && parseInt(current) >= limit) {
      const ttl = await this.redis.ttl(key);
      throw new Error(`Rate limit exceeded for session ${sessionId}. Try again in ${ttl} seconds.`);
    }
  }

  private async updateRateLimit(sessionId: string): Promise<void> {
    const key = `rate_limit:outgoing:${sessionId}`;
    const window = 60; // 60 seconds
    
    const pipeline = this.redis.pipeline();
    pipeline.incr(key);
    pipeline.expire(key, window);
    await pipeline.exec();
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}