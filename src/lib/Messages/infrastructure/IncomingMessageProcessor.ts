import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Inject, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { IncomingMessageJob, BulkIncomingMessageJob } from './IncomingMessageQueue';
import { MessagesHandleIncoming } from '../application/MessagesHandleIncoming';
import { EventLogsCreate } from '../../EventLogs/application/EventLogsCreate';

@Processor('incoming-messages')
export class IncomingMessageProcessor extends WorkerHost {
  private readonly logger = new Logger(IncomingMessageProcessor.name);

  constructor(
    @Inject('MessagesHandleIncoming')
    private readonly messagesHandleIncoming: MessagesHandleIncoming,
    @Inject('EventLogsCreate')
    private readonly eventLogsCreate: EventLogsCreate,
  ) {
    super();
  }

  @OnWorkerEvent('active')
  onActive(job: Job) {
    this.logger.debug(`Processing incoming message for session ${job.data.sessionId}`);
  }

  @OnWorkerEvent('completed')
  onComplete(job: Job) {
    this.logger.debug(`Completed incoming message processing`);
  }

  @OnWorkerEvent('failed')
  onError(job: Job, error: any) {
    this.logger.error(`Failed incoming message processing: ${error.message}`);
  }

  async process(job: Job<IncomingMessageJob | BulkIncomingMessageJob>): Promise<void> {
    try {
      if (job.name === 'process-incoming') {
        await this.processSingleIncomingMessage(job as Job<IncomingMessageJob>);
      } else if (job.name === 'process-bulk-incoming') {
        await this.processBulkIncomingMessages(job as Job<BulkIncomingMessageJob>);
      } else if (job.name === 'process-media-incoming') {
        await this.processMediaIncomingMessage(job as Job<IncomingMessageJob>);
      }
    } catch (error) {
      this.logger.error(`Error processing incoming message: ${error.message}`);
      throw error;
    }
  }

  private async processSingleIncomingMessage(job: Job<IncomingMessageJob>): Promise<void> {
    const { sessionId, messageData, messageContent, processingFlags } = job.data;

    try {
      // Step 1: Create base message record
      // Use the existing method from MessagesHandleIncoming
      const mockSocket = {}; // We might need to pass the actual socket later
      const mockMessages = [{
        key: {
          id: messageData.baileysId,
          remoteJid: `${messageData.from}@s.whatsapp.net`,
          fromMe: false
        },
        message: messageData.baileysJson
      }];
      
      await this.messagesHandleIncoming.handleIncomingMessages(sessionId, mockMessages, mockSocket);
      
      // For now, we'll create a mock result
      const messageResult = { id: messageData.baileysId };

      // Step 2: Log status update (will implement queue later)  
      this.logger.debug(`Message ${messageData.baileysId} processed for ${sessionId}`);

      // Step 3: Process content based on message type
      if (processingFlags.needsMediaDownload && messageContent?.mediaUrl) {
        await this.processMediaContent(messageResult.id, sessionId, messageContent);
      } else if (messageContent?.text) {
        await this.processTextContent(messageResult.id, sessionId, messageContent);
      } else if (messageContent?.emoji) {
        await this.processReactionContent(messageResult.id, sessionId, messageContent);
      }

      // Step 4: Log event for traceability
      await this.logIncomingMessageEvent(sessionId, messageData, 'processed');

      // Step 5: Handle notifications if required
      if (processingFlags.requiresNotification) {
        await this.handleNotifications(sessionId, messageData, messageContent);
      }

    } catch (error) {
      this.logger.error(`Failed to process incoming message ${messageData.baileysId}: ${error.message}`);
      
      // Log failure event
      await this.logIncomingMessageEvent(sessionId, messageData, 'failed', error.message);
      
      throw error;
    }
  }

  private async processMediaIncomingMessage(job: Job<IncomingMessageJob>): Promise<void> {
    const { sessionId, messageData, messageContent } = job.data;

    try {
      // This is specifically for media processing with download and S3 upload
      if (!messageContent?.mediaUrl) {
        throw new Error('Media URL is required for media processing');
      }

      // For now, just log media processing - will implement download/upload later
      this.logger.debug(`Media processing for ${messageData.baileysId}: ${messageContent?.mediaType}`);

    } catch (error) {
      this.logger.error(`Failed to process media message ${messageData.baileysId}: ${error.message}`);
      throw error;
    }
  }

  private async processBulkIncomingMessages(job: Job<BulkIncomingMessageJob>): Promise<void> {
    const { sessionId, messages, batchId, receivedAt } = job.data;
    
    this.logger.log(`Processing bulk incoming messages batch ${batchId} with ${messages.length} messages`);

    const results = await Promise.allSettled(
      messages.map(async (messageJob, index) => {
        return this.processSingleIncomingMessage({
          data: {
            sessionId,
            ...messageJob,
          }
        } as Job<IncomingMessageJob>);
      })
    );

    const failures = results.filter(result => result.status === 'rejected');
    const successes = results.filter(result => result.status === 'fulfilled');

    this.logger.log(
      `Bulk incoming batch ${batchId} completed: ${successes.length} successes, ${failures.length} failures`
    );

    if (failures.length > 0) {
      this.logger.warn(`Batch ${batchId} had ${failures.length} failures`, {
        failures: failures.map((failure, index) => ({
          messageIndex: index,
          error: failure.reason?.message,
        })),
      });
    }

    // For now, skip bulk event logging to avoid foreign key issues
    // TODO: Implement proper event lookup by name like BaileysEventLogger
    this.logger.debug(`Bulk processing completed for batch ${batchId}`);
  }

  private async processTextContent(messageId: string, sessionId: string, content: any): Promise<void> {
    // This would integrate with TextMessages module
    this.logger.debug(`Processing text content for message ${messageId}`);
  }

  private async processReactionContent(messageId: string, sessionId: string, content: any): Promise<void> {
    // This would integrate with ReactionMessages module
    this.logger.debug(`Processing reaction content for message ${messageId}`);
  }

  private async processMediaContent(messageId: string, sessionId: string, content: any): Promise<void> {
    // This would integrate with MediaMessages module
    this.logger.debug(`Processing media content for message ${messageId}`);
  }

  private async logIncomingMessageEvent(
    sessionId: string, 
    messageData: any, 
    status: string, 
    error?: string
  ): Promise<void> {
    try {
      // For now, skip event logging to avoid foreign key issues
      // TODO: Implement proper event lookup by name like BaileysEventLogger
      this.logger.debug(`Incoming message ${status} for ${messageData.baileysId}`);
    } catch (logError) {
      this.logger.warn(`Failed to log incoming message event: ${logError.message}`);
    }
  }

  private async handleNotifications(sessionId: string, messageData: any, content: any): Promise<void> {
    // Placeholder for notification handling
    this.logger.debug(`Handling notifications for message ${messageData.baileysId}`);
  }
}