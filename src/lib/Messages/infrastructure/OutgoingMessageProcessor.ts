import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Inject, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import {
  OutgoingMessageJob,
  BulkOutgoingMessageJob,
} from './OutgoingMessageQueue';
import { SessionRateLimiter } from './SessionRateLimiter';
import Redis from 'ioredis';
import { v4 as uuidv4 } from 'uuid';

@Processor('outgoing-messages')
export class OutgoingMessageProcessor extends WorkerHost {
  private readonly logger = new Logger(OutgoingMessageProcessor.name);
  private readonly redis: Redis;
  
  constructor(
    @Inject('MessagesCreate')
    private readonly messagesCreate: any,
    @Inject('MessageSender')
    private readonly messageSender: any,
    @Inject('MessagesOrchestrator')
    private readonly messagesOrchestrator: any,
    private readonly sessionRateLimiter: SessionRateLimiter,
  ) {
    super();
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      username: process.env.REDIS_USERNAME || 'default',
      password: process.env.REDIS_PASSWORD,
      maxRetriesPerRequest: null,
    });
  }

  @OnWorkerEvent('active')
  onActive(job: Job) {
    this.logger.debug(
      `Processing outgoing message for session ${job.data.sessionId}`,
    );
  }

  @OnWorkerEvent('completed')
  onComplete(job: Job) {
    this.logger.debug(`Completed outgoing message`);
  }

  @OnWorkerEvent('failed')
  onError(job: Job, error: any) {
    this.logger.error(`Failed outgoing message: ${error.message}`);
  }

  async process(
    job: Job<OutgoingMessageJob | BulkOutgoingMessageJob>,
  ): Promise<void> {
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

  private async processSingleMessage(
    job: Job<OutgoingMessageJob>,
  ): Promise<void> {
    const { sessionId, messageType, messageData } = job.data;

    // Check rate limit before sending
    const rateLimitResult = await this.sessionRateLimiter.canSend(sessionId);
    
    if (!rateLimitResult.allowed) {
      const retryAfter = rateLimitResult.retryAfter || 60;
      this.logger.warn(
        `Rate limit exceeded for session ${sessionId}. Processing will pause for ${retryAfter}s`
      );
      
      // For the legacy processor, we'll just throw an error
      // The new session-based processor handles pausing properly
      throw new Error(`Rate limit exceeded - wait ${retryAfter}s before retry`);
    }

    try {
      let result;

      // Actually send the message based on type
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
        `Sent ${messageType} message for ${sessionId}: ${result.messageId}`,
      );

      // Increment rate limiting counter after successful send
      await this.sessionRateLimiter.increment(sessionId);

      return result;
    } catch (error) {
      this.logger.error(
        `Failed to send ${messageType} message for session ${sessionId}: ${error.message}`,
      );
      throw error;
    }
  }

  private async processBulkMessages(
    job: Job<BulkOutgoingMessageJob>,
  ): Promise<void> {
    const {
      sessionId,
      messages,
      batchId,
      delayBetweenMessages = 2000,
    } = job.data;

    this.logger.log(
      `Processing bulk messages batch ${batchId} with ${messages.length} messages`,
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
            `Rate limit exceeded for session ${sessionId} during bulk send. Waiting ${retryAfter}s`
          );
          await this.delay(retryAfter * 1000);
          i--; // Retry the current message
          continue;
        }

        const result = await this.processSingleMessage({
          data: {
            sessionId,
            ...messageJob,
          },
        } as Job<OutgoingMessageJob>);

        results.push({ index: i, status: 'success', result });

        // Rate limit increment is handled in processSingleMessage

        // Delay between messages (except for the last one)
        if (i < messages.length - 1) {
          await this.delay(delayBetweenMessages);
        }
      } catch (error) {
        this.logger.error(
          `Failed to send message ${i} in batch ${batchId}: ${error.message}`,
        );
        results.push({ index: i, status: 'failed', error: error.message });

        // Continue with next message even if one fails
        await this.delay(delayBetweenMessages);
      }
    }

    const failures = results.filter((r) => r.status === 'failed');
    const successes = results.filter((r) => r.status === 'success');

    this.logger.log(
      `Bulk batch ${batchId} completed: ${successes.length} successes, ${failures.length} failures`,
    );

    if (failures.length > messages.length * 0.7) {
      throw new Error(
        `Bulk batch ${batchId} failed: too many failures (${failures.length}/${messages.length})`,
      );
    }
  }

  async getRateLimitStats(sessionId: string) {
    return await this.sessionRateLimiter.getRateLimitStats(sessionId);
  }

  async setSessionRateLimit(sessionId: string, limit: number) {
    return await this.sessionRateLimiter.setSessionLimit(sessionId, limit);
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  private async sendTextMessage(
    sessionId: string,
    messageData: any,
  ): Promise<any> {
    const { to, content, quotedMessageId } = messageData;
    const messageId = uuidv4();
    console.log(`📤 [OutgoingProcessor] Sending text message:`, {
      sessionId,
      to,
      content,
      quotedMessageId,
    });

    // Parse quotedMessageId properly - it can be a string (UUID) or JSON
    let quotedData: any = undefined;
    if (quotedMessageId) {
      try {
        // Try to parse as JSON first (legacy behavior)
        quotedData = JSON.parse(quotedMessageId);
      } catch (error) {
        // If parsing fails, treat it as a UUID and look up the full message object
        try {
          quotedData =
            await this.messagesOrchestrator.getMessageBaileysObject(
              quotedMessageId,
            );
          console.log(
            `📝 [OutgoingProcessor] Found Baileys object for quoted message UUID: ${quotedMessageId}`,
          );
        } catch (lookupError) {
          console.warn(
            `📝 [OutgoingProcessor] Could not find message with UUID: ${quotedMessageId}`,
            lookupError.message,
          );
          quotedData = undefined;
        }
      }
    }

    // Send message through Baileys
    const sentMessage = await this.messageSender.sendTextMessage(
      sessionId,
      to,
      { text: content },
      quotedData,
    );

    if (sentMessage) {
      // Save message to database
      await this.messagesCreate.run(
        messageId,
        sentMessage,
        'txt',
        quotedMessageId || null,
        sessionId,
        to.replace('@s.whatsapp.net', ''),
        true, // fromMe: true for outgoing messages
        new Date(),
      );

      return { messageId, success: true };
    } else {
      throw new Error('Failed to send text message through WhatsApp');
    }
  }
  private async sendMediaMessage(
    sessionId: string,
    messageData: any,
  ): Promise<any> {
    const { to, content, mediaType, fileName, caption, quotedMessageId } =
      messageData;
    const messageId = uuidv4();

    console.log(`📤 [OutgoingProcessor] Sending media message:`, {
      sessionId,
      to,
      content,
      mediaType,
      fileName,
      caption,
    });

    const payload = {
      url: content, // content contains the media URL
      caption,
      media_type: mediaType,
      mime_type: 'application/octet-stream', // Will be determined by the sender
      file_name: fileName,
      file_path: content,
    }; // Parse quotedMessageId properly - it can be a string (UUID) or JSON
    let quotedData: any = undefined;
    if (quotedMessageId) {
      try {
        // Try to parse as JSON first (legacy behavior)
        quotedData = JSON.parse(quotedMessageId);
      } catch (error) {
        // If parsing fails, treat it as a UUID and look up the full message object
        try {
          quotedData =
            await this.messagesOrchestrator.getMessageBaileysObject(
              quotedMessageId,
            );
          console.log(
            `📝 [OutgoingProcessor] Found Baileys object for quoted message UUID: ${quotedMessageId}`,
          );
        } catch (lookupError) {
          console.warn(
            `📝 [OutgoingProcessor] Could not find message with UUID: ${quotedMessageId}`,
            lookupError.message,
          );
          quotedData = undefined;
        }
      }
    }

    // Send media message through Baileys
    const sentMessage = await this.messageSender.sendMediaMessage(
      sessionId,
      to,
      mediaType,
      payload,
      quotedData,
    );

    if (sentMessage) {
      // Save message to database
      await this.messagesCreate.run(
        messageId,
        sentMessage,
        'media',
        quotedMessageId || null,
        sessionId,
        to.replace('@s.whatsapp.net', ''),
        true, // fromMe: true for outgoing messages
        new Date(),
      );

      return { messageId, success: true };
    } else {
      throw new Error('Failed to send media message through WhatsApp');
    }
  }
  private async sendReactionMessage(
    sessionId: string,
    messageData: any,
  ): Promise<any> {
    const { to, content, emoji, targetMessageId } = messageData;
    const messageId = uuidv4();

    console.log(`📤 [OutgoingProcessor] Sending reaction:`, {
      sessionId,
      to,
      emoji: content,
      targetMessageId,
    });

    // Get the Baileys key for the target message using UUID lookup
    let targetMessageKey: any;
    try {
      const targetMessageData = await this.messagesOrchestrator.getMessageBaileysObject(targetMessageId);
      targetMessageKey = targetMessageData.key;
      console.log(`📝 [OutgoingProcessor] Found Baileys key for target message UUID: ${targetMessageId}`);
    } catch (lookupError) {
      console.error(`📝 [OutgoingProcessor] Could not find target message with UUID: ${targetMessageId}`, lookupError.message);
      throw new Error(`Target message with UUID ${targetMessageId} not found`);
    }

    const payload = {
      key: targetMessageKey,
      emoji: content,
    };

    // Send reaction through Baileys
    const sentMessage = await this.messageSender.sendReactMessage(
      sessionId,
      to,
      payload,
    );

    if (sentMessage) {
      // Save message to database
      await this.messagesCreate.run(
        messageId,
        sentMessage,
        'react',
        targetMessageId,
        sessionId,
        to.replace('@s.whatsapp.net', ''),
        true, // fromMe: true for outgoing messages
        new Date(),
      );

      return { messageId, success: true };
    } else {
      throw new Error('Failed to send reaction through WhatsApp');
    }
  }
}
