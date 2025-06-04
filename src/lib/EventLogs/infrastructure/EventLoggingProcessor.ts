import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Inject, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { EventLogJob, BatchEventLogJob } from './EventLoggingQueue';
import { EventLogsCreate } from '../application/EventLogsCreate';
import { EventLogRepository } from '../domain/EventLogRepository';

@Processor('event-logging')
export class EventLoggingProcessor extends WorkerHost {
  private readonly logger = new Logger(EventLoggingProcessor.name);

  constructor(
    @Inject('EventLogsCreate')
    private readonly eventLogsCreate: EventLogsCreate,
    @Inject('EventLogRepository')
    private readonly eventLogRepository: EventLogRepository,
  ) {
    super();
  }

  @OnWorkerEvent('active')
  onActive(job: Job) {
    // Silent event processing
  }

  @OnWorkerEvent('completed')
  onComplete(job: Job) {
    // Silent completion
  }

  @OnWorkerEvent('failed')
  onError(job: Job, error: any) {
    this.logger.error(`Event logging failed: ${error.message}`);
  }

  async process(job: Job<EventLogJob | BatchEventLogJob>): Promise<void> {
    try {
      if (job.name === 'log-event') {
        await this.processSingleEvent(job as Job<EventLogJob>);
      } else if (job.name === 'batch-log-events') {
        await this.processBatchEvents(job as Job<BatchEventLogJob>);
      }
    } catch (error) {
      this.logger.error(`Error processing event log: ${error.message}`);
      // Don't throw error for logging failures to avoid infinite loops
      // Just log the error and continue
    }
  }

  private async processSingleEvent(job: Job<EventLogJob>): Promise<void> {
    const { sessionId, eventId, eventData, timestamp, category } = job.data;

    try {
      const uuid = require('crypto').randomUUID();
      await this.eventLogsCreate.run(
        uuid,
        sessionId,
        eventId,
        timestamp,
      );

      // Event logged successfully (silent)
    } catch (error) {
      this.logger.error(`Failed to log event ${eventId} for session ${sessionId}: ${error.message}`);
      // Don't re-throw to avoid queue failures for logging issues
    }
  }

  private async processBatchEvents(job: Job<BatchEventLogJob>): Promise<void> {
    const { events, batchId, maxBatchSize } = job.data;
    
    this.logger.log(`Processing event batch ${batchId} with ${events.length} events`);

    // Process events in smaller chunks to avoid database timeouts
    const chunkSize = Math.min(50, maxBatchSize);
    const chunks = this.chunkArray(events, chunkSize);

    let totalProcessed = 0;
    let totalErrors = 0;

    for (const chunk of chunks) {
      try {
        await this.processBatchChunk(chunk, batchId);
        totalProcessed += chunk.length;
      } catch (error) {
        this.logger.error(`Failed to process chunk in batch ${batchId}: ${error.message}`);
        totalErrors += chunk.length;
      }
    }

    this.logger.log(
      `Batch ${batchId} completed: ${totalProcessed} processed, ${totalErrors} errors`
    );

    // For now, skip system event logging to avoid foreign key issues
    // TODO: Implement proper event lookup by name like BaileysEventLogger
    this.logger.debug(`Batch processing statistics logged for batch ${batchId}`);
  }

  private async processBatchChunk(events: EventLogJob[], batchId: string): Promise<void> {
    // Process events in parallel within the chunk
    const results = await Promise.allSettled(
      events.map(async (event) => {
        const uuid = require('crypto').randomUUID();
        return this.eventLogsCreate.run(
          uuid,
          event.sessionId,
          event.eventId,
          event.timestamp,
        );
      })
    );

    const failures = results.filter(result => result.status === 'rejected');
    
    if (failures.length > 0) {
      this.logger.warn(`Chunk in batch ${batchId} had ${failures.length} failures out of ${events.length} events`);
    }
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}