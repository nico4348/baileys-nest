import { Injectable, Logger, OnModuleDestroy, Inject, forwardRef } from '@nestjs/common';
import { Worker, Job } from 'bullmq';
import { OutgoingMessageJob, BulkOutgoingMessageJob } from './OutgoingMessageQueue';
import { SessionRateLimiter } from './SessionRateLimiter';
import { OutgoingQueueManager } from './OutgoingQueueManager';
import { SessionsGetOneById } from '../../Sessions/application/SessionsGetOneById';
import Redis from 'ioredis';
import { v4 as uuidv4 } from 'uuid';

export interface SessionWorkerConfig {
  sessionId: string;
  concurrency?: number;
  enabled?: boolean;
}

@Injectable()
export class OutgoingSessionProcessor implements OnModuleDestroy {
  private readonly logger = new Logger(OutgoingSessionProcessor.name);
  private readonly redis: Redis;
  private readonly sessionWorkers = new Map<string, Worker>();
  private readonly workerConfig = new Map<string, SessionWorkerConfig>();
  private readonly resumeTimeouts = new Map<string, NodeJS.Timeout>();

  constructor(
    @Inject('MessagesCreate')
    private readonly messagesCreate: any,
    @Inject('MessageSender')
    private readonly messageSender: any,
    @Inject('MessagesOrchestrator')
    private readonly messagesOrchestrator: any,
    private readonly sessionRateLimiter: SessionRateLimiter,
    @Inject(forwardRef(() => OutgoingQueueManager))
    private readonly queueManager: OutgoingQueueManager,
    @Inject('SessionsGetOneById')
    private readonly sessionsGetOneById: SessionsGetOneById,
  ) {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      username: process.env.REDIS_USERNAME || 'default',
      password: process.env.REDIS_PASSWORD,
      maxRetriesPerRequest: null,
    });
  }

  async ensureSessionWorker(sessionId: string): Promise<void> {
    if (this.sessionWorkers.has(sessionId)) {
      this.logger.debug(`Worker for session ${sessionId} already exists`);
      return;
    }

    await this.createSessionWorker(sessionId);
  }

  async createSessionWorker(sessionId: string, config?: SessionWorkerConfig): Promise<void> {
    if (this.sessionWorkers.has(sessionId)) {
      this.logger.warn(`Worker for session ${sessionId} already exists`);
      return;
    }

    try {
      const queueName = `outgoing-messages-${sessionId}`;
      const workerConfig: SessionWorkerConfig = {
        sessionId,
        concurrency: config?.concurrency || 1,
        enabled: config?.enabled !== false,
      };

      this.logger.log(`Creating worker for session ${sessionId} with queue: ${queueName}`);
      
      const worker = new Worker(
        queueName,
        async (job: Job<OutgoingMessageJob | BulkOutgoingMessageJob>) => {
          this.logger.debug(`🎯 Processing job ${job.id} for session ${sessionId}`);
          return await this.processJob(sessionId, job);
        },
        {
          connection: this.redis,
          concurrency: workerConfig.concurrency,
        }
      );

      // Setup worker event handlers
      this.setupWorkerEventHandlers(worker, sessionId);

      this.sessionWorkers.set(sessionId, worker);
      this.workerConfig.set(sessionId, workerConfig);

      this.logger.log(`✅ Worker created for session ${sessionId} with concurrency ${workerConfig.concurrency}`);
      
      // Ensure the queue is not paused when creating a new worker
      try {
        await this.queueManager.resumeSession(sessionId);
        this.logger.debug(`▶️ Ensured queue is active for session ${sessionId}`);
      } catch (resumeError) {
        this.logger.error(`❌ Failed to ensure queue is active for session ${sessionId}: ${resumeError.message}`);
      }
    } catch (error) {
      this.logger.error(`💥 Error creating worker for session ${sessionId}: ${error.message}`);
      throw error;
    }
  }

  async removeSessionWorker(sessionId: string): Promise<void> {
    const worker = this.sessionWorkers.get(sessionId);
    if (worker) {
      await worker.close();
      this.sessionWorkers.delete(sessionId);
      this.workerConfig.delete(sessionId);
      
      // Clear any pending resume timeout
      const timeout = this.resumeTimeouts.get(sessionId);
      if (timeout) {
        clearTimeout(timeout);
        this.resumeTimeouts.delete(sessionId);
        this.logger.warn(`🗑️ Cleared timeout for removed session ${sessionId}`);
      }
      
      this.logger.log(`Removed worker for session ${sessionId}`);
    }
  }


  async pauseSessionQueue(sessionId: string): Promise<void> {
    try {
      await this.queueManager.pauseSession(sessionId);
      this.logger.warn(`⏸️ Successfully paused queue for session ${sessionId}`);
    } catch (error) {
      this.logger.error(`❌ Error pausing queue for session ${sessionId}: ${error.message}`);
      throw error;
    }
  }

  async resumeSessionQueue(sessionId: string): Promise<void> {
    try {
      await this.queueManager.resumeSession(sessionId);
      this.logger.warn(`▶️ Successfully resumed queue for session ${sessionId}`);
    } catch (error) {
      this.logger.error(`❌ Error resuming queue for session ${sessionId}: ${error.message}`);
      throw error;
    }
  }


  private scheduleQueueResume(sessionId: string, delayMs: number): void {
    // Clear any existing timeout for this session
    const existingTimeout = this.resumeTimeouts.get(sessionId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
      this.logger.warn(`🗑️ Cleared existing resume timeout for session ${sessionId}`);
    }
    
    this.logger.warn(`🔄 Scheduling automatic queue resume for session ${sessionId} in ${delayMs / 1000}s`);
    
    const timeoutId = setTimeout(() => {
      this.logger.warn(`⏰ Auto-resume triggered for session ${sessionId}`);
      
      // Remove from timeout tracking
      this.resumeTimeouts.delete(sessionId);
      
      // Reset the rate limit first, then resume the queue
      this.sessionRateLimiter.reset(sessionId)
        .then(() => {
          this.logger.warn(`🔄 Rate limit counter reset for session ${sessionId}`);
          // Then resume the queue processing
          return this.resumeSessionQueue(sessionId);
        })
        .then(() => {
          this.logger.warn(`✅ Queue automatically resumed for session ${sessionId} - messages will now process`);
        })
        .catch((error) => {
          this.logger.error(`❌ Failed to auto-resume queue for session ${sessionId}: ${error.message}`);
          // Retry resume after 5 seconds if it fails
          this.logger.warn(`🔄 Retrying auto-resume for session ${sessionId} in 5s`);
          this.scheduleQueueResume(sessionId, 5000);
        });
    }, delayMs);
    
    // Track the timeout
    this.resumeTimeouts.set(sessionId, timeoutId);
    this.logger.warn(`⏱️ Auto-resume scheduled for session ${sessionId}. Active schedules: ${this.resumeTimeouts.size}`);
  }

  async updateSessionWorkerConcurrency(sessionId: string, concurrency: number): Promise<void> {
    const config = this.workerConfig.get(sessionId);
    if (config) {
      config.concurrency = concurrency;
      // Note: Bull doesn't support dynamic concurrency updates, 
      // so we need to recreate the worker
      await this.removeSessionWorker(sessionId);
      await this.createSessionWorker(sessionId, config);
    }
  }

  getActiveSessionWorkers(): string[] {
    return Array.from(this.sessionWorkers.keys());
  }

  getWorkerCount(): number {
    return this.sessionWorkers.size;
  }

  async getSessionWorkerStats(sessionId: string) {
    const worker = this.sessionWorkers.get(sessionId);
    const config = this.workerConfig.get(sessionId);
    
    if (!worker || !config) {
      return null;
    }

    return {
      sessionId,
      isRunning: worker.isRunning(),
      isPaused: worker.isPaused(),
      concurrency: config.concurrency,
      enabled: config.enabled,
    };
  }

  async getAllWorkerStats() {
    const stats = new Map<string, any>();
    
    for (const sessionId of this.sessionWorkers.keys()) {
      stats.set(sessionId, await this.getSessionWorkerStats(sessionId));
    }
    
    return Object.fromEntries(stats);
  }

  private async processJob(
    sessionId: string,
    job: Job<OutgoingMessageJob | BulkOutgoingMessageJob>
  ): Promise<any> {
    try {
      // Validate session is active before processing any job
      await this.validateSessionIsActive(sessionId);

      if (job.name === 'send-message' || job.name === 'outgoing-message') {
        return await this.processSingleMessage(sessionId, job as Job<OutgoingMessageJob>);
      } else if (job.name === 'send-bulk-messages') {
        return await this.processBulkMessages(sessionId, job as Job<BulkOutgoingMessageJob>);
      } else {
        this.logger.warn(`Unknown job type: ${job.name}. Available types: send-message, outgoing-message, send-bulk-messages`);
        throw new Error(`Unknown job type: ${job.name}`);
      }
    } catch (error) {
      this.logger.error(`Error processing job for session ${sessionId}: ${error.message}`);
      
      // Handle rate limit rescheduling
      if (error.message.startsWith('RESCHEDULE_DELAY:')) {
        const delayMs = parseInt(error.message.split(':')[1]);
        throw new Error(`Rate limit exceeded. Rescheduling with ${delayMs}ms delay`);
      }
      
      throw error;
    }
  }

  private async processSingleMessage(
    sessionId: string,
    job: Job<OutgoingMessageJob>
  ): Promise<any> {
    const { messageType, messageData } = job.data;

    // Check rate limit before sending
    const rateLimitResult = await this.sessionRateLimiter.canSend(sessionId);
    
    if (!rateLimitResult.allowed) {
      const retryAfter = rateLimitResult.retryAfter || 60;
      this.logger.warn(
        `Rate limit exceeded for session ${sessionId}. Pausing queue for ${retryAfter}s`
      );
      
      // Pause the queue processing for this session
      try {
        await this.pauseSessionQueue(sessionId);
        this.logger.warn(`⏸️ Queue paused successfully, scheduling resume in ${retryAfter}s`);
        
        // Schedule resuming the queue
        this.scheduleQueueResume(sessionId, retryAfter * 1000);
      } catch (error) {
        this.logger.error(`❌ Failed to pause queue for session ${sessionId}: ${error.message}`);
        // Still try to schedule resume
        this.scheduleQueueResume(sessionId, retryAfter * 1000);
      }
      
      // Throw error to fail this job, queue is paused so no more jobs will process
      throw new Error(`Rate limit exceeded - queue paused for ${retryAfter}s`);
    }

    try {
      let result;

      // Send the message based on type
      switch (messageType) {
        case 'text':
          result = await this.sendTextMessage(sessionId, messageData);
          break;
        case 'media':
          result = await this.sendMediaMessage(sessionId, messageData);
          break;
        case 'reaction':
          result = await this.sendReactionMessage(sessionId, messageData);
          break;
        default:
          throw new Error(`Unsupported message type: ${messageType}`);
      }

      this.logger.debug(
        `Sent ${messageType} message for ${sessionId}: ${result.messageId}`
      );

      // Increment rate limiting counter after successful send
      await this.sessionRateLimiter.increment(sessionId);

      return result;
    } catch (error) {
      this.logger.error(
        `Failed to send ${messageType} message for session ${sessionId}: ${error.message}`
      );
      throw error;
    }
  }

  private async processBulkMessages(
    sessionId: string,
    job: Job<BulkOutgoingMessageJob>
  ): Promise<any> {
    const { messages, batchId, delayBetweenMessages = 2000 } = job.data;

    this.logger.log(
      `Processing bulk messages batch ${batchId} with ${messages.length} messages for session ${sessionId}`
    );

    const results: Array<{
      index: number;
      status: string;
      result?: any;
      error?: string;
    }> = [];

    for (let i = 0; i < messages.length; i++) {
      const messageJob = messages[i];

      try {
        // Check rate limit before each message
        const rateLimitResult = await this.sessionRateLimiter.canSend(sessionId);
        
        if (!rateLimitResult.allowed) {
          const retryAfter = rateLimitResult.retryAfter || 60;
          this.logger.warn(
            `Rate limit exceeded for session ${sessionId} during bulk send. Pausing for ${retryAfter}s`
          );
          
          // For bulk messages, we wait instead of pausing the worker
          // since we're already processing a single bulk job
          await this.delay(retryAfter * 1000);
          
          // Continue processing from where we left off
          i--; // Retry the current message
          continue;
        }

        const result = await this.processSingleMessage(sessionId, {
          data: {
            sessionId,
            ...messageJob,
          },
        } as Job<OutgoingMessageJob>);

        results.push({ index: i, status: 'success', result });

        // Delay between messages (except for the last one)
        if (i < messages.length - 1) {
          await this.delay(delayBetweenMessages);
        }
      } catch (error) {
        this.logger.error(
          `Failed to send message ${i} in batch ${batchId}: ${error.message}`
        );
        results.push({ index: i, status: 'failed', error: error.message });

        // Continue with next message even if one fails
        await this.delay(delayBetweenMessages);
      }
    }

    const failures = results.filter((r) => r.status === 'failed');
    const successes = results.filter((r) => r.status === 'success');

    this.logger.log(
      `Bulk batch ${batchId} completed for session ${sessionId}: ${successes.length} successes, ${failures.length} failures`
    );

    if (failures.length > messages.length * 0.7) {
      throw new Error(
        `Bulk batch ${batchId} failed: too many failures (${failures.length}/${messages.length})`
      );
    }

    return { successes: successes.length, failures: failures.length };
  }

  private async sendTextMessage(sessionId: string, messageData: any): Promise<any> {
    const { to, content, quotedMessageId } = messageData;
    const messageId = uuidv4();
    
    let quotedData: any = undefined;
    if (quotedMessageId) {
      try {
        quotedData = JSON.parse(quotedMessageId);
      } catch (error) {
        try {
          quotedData = await this.messagesOrchestrator.getMessageBaileysObject(quotedMessageId);
        } catch (lookupError) {
          this.logger.warn(`Could not find message with UUID: ${quotedMessageId}`);
          quotedData = undefined;
        }
      }
    }

    const sentMessage = await this.messageSender.sendTextMessage(
      sessionId,
      to,
      { text: content },
      quotedData
    );

    if (sentMessage) {
      await this.messagesCreate.run(
        messageId,
        sentMessage,
        'txt',
        quotedMessageId || null,
        sessionId,
        to.replace('@s.whatsapp.net', ''),
        true,
        new Date()
      );

      return { messageId, success: true };
    } else {
      throw new Error('Failed to send text message through WhatsApp');
    }
  }

  private async sendMediaMessage(sessionId: string, messageData: any): Promise<any> {
    const { to, content, mediaType, fileName, caption, quotedMessageId } = messageData;
    const messageId = uuidv4();

    const payload = {
      url: content,
      caption,
      media_type: mediaType,
      mime_type: 'application/octet-stream',
      file_name: fileName,
      file_path: content,
    };

    let quotedData: any = undefined;
    if (quotedMessageId) {
      try {
        quotedData = JSON.parse(quotedMessageId);
      } catch (error) {
        try {
          quotedData = await this.messagesOrchestrator.getMessageBaileysObject(quotedMessageId);
        } catch (lookupError) {
          this.logger.warn(`Could not find message with UUID: ${quotedMessageId}`);
          quotedData = undefined;
        }
      }
    }

    const sentMessage = await this.messageSender.sendMediaMessage(
      sessionId,
      to,
      mediaType,
      payload,
      quotedData
    );

    if (sentMessage) {
      await this.messagesCreate.run(
        messageId,
        sentMessage,
        'media',
        quotedMessageId || null,
        sessionId,
        to.replace('@s.whatsapp.net', ''),
        true,
        new Date()
      );

      return { messageId, success: true };
    } else {
      throw new Error('Failed to send media message through WhatsApp');
    }
  }

  private async sendReactionMessage(sessionId: string, messageData: any): Promise<any> {
    const { to, content, emoji, targetMessageId } = messageData;
    const messageId = uuidv4();

    let targetMessageKey: any;
    try {
      const targetMessageData = await this.messagesOrchestrator.getMessageBaileysObject(targetMessageId);
      targetMessageKey = targetMessageData.key;
    } catch (lookupError) {
      this.logger.error(`Could not find target message with UUID: ${targetMessageId}`);
      throw new Error(`Target message with UUID ${targetMessageId} not found`);
    }

    const payload = {
      key: targetMessageKey,
      emoji: content,
    };

    const sentMessage = await this.messageSender.sendReactMessage(sessionId, to, payload);

    if (sentMessage) {
      await this.messagesCreate.run(
        messageId,
        sentMessage,
        'react',
        targetMessageId,
        sessionId,
        to.replace('@s.whatsapp.net', ''),
        true,
        new Date()
      );

      return { messageId, success: true };
    } else {
      throw new Error('Failed to send reaction through WhatsApp');
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async validateSessionIsActive(sessionId: string): Promise<void> {
    try {
      const session = await this.sessionsGetOneById.run(sessionId);
      
      if (!session) {
        throw new Error(`Session ${sessionId} not found`);
      }

      if (!session.status || session.status.value === false) {
        throw new Error(`Session ${sessionId} is not online - cannot process messages`);
      }

      this.logger.debug(`Session ${sessionId} validation passed during processing - status: ${session.status.value}`);
    } catch (error) {
      this.logger.warn(`Session validation failed during processing for ${sessionId}: ${error.message}`);
      throw error;
    }
  }

  private setupWorkerEventHandlers(worker: Worker, sessionId: string): void {
    worker.on('ready', () => {
      this.logger.debug(`Worker ready for session ${sessionId}`);
    });

    worker.on('active', (job: Job) => {
      this.logger.debug(`Processing message for session ${sessionId}: ${job.id}`);
    });

    worker.on('completed', (job: Job) => {
      this.logger.debug(`Completed message for session ${sessionId}: ${job.id}`);
    });

    worker.on('failed', (job: Job, error: Error) => {
      this.logger.error(`Failed message for session ${sessionId}: ${job.id} - ${error.message}`);
    });

    worker.on('error', (error: Error) => {
      this.logger.error(`Worker error for session ${sessionId}:`, error);
    });

    worker.on('stalled', (jobId: string) => {
      this.logger.warn(`Job stalled for session ${sessionId}: ${jobId}`);
    });
  }

  async onModuleDestroy() {
    this.logger.log('Closing all session workers...');
    
    // Clear all timeouts
    for (const [sessionId, timeout] of this.resumeTimeouts) {
      clearTimeout(timeout);
      this.logger.warn(`🗑️ Cleared timeout for session ${sessionId} on module destroy`);
    }
    this.resumeTimeouts.clear();
    
    const closePromises = Array.from(this.sessionWorkers.values()).map(worker => worker.close());
    await Promise.all(closePromises);
    
    this.sessionWorkers.clear();
    this.workerConfig.clear();
    await this.redis.disconnect();
    
    this.logger.log('All session workers closed');
  }
}