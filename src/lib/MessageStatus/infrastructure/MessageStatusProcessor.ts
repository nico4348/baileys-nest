import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Inject, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import {
  MessageStatusUpdateJob,
  BatchStatusUpdateJob,
} from './MessageStatusQueue';
import { MessageStatusRepository } from '../domain/MessageStatusRepository';
import { MessageStatusCreate } from '../application/MessageStatusCreate';
import { MessageStatusMessageId } from '../domain/MessageStatusMessageId';
import { MessageStatusStatusId } from '../domain/MessageStatusStatusId';
import { MessageStatusCreatedAt } from '../domain/MessageStatusCreatedAt';
import { randomUUID } from 'node:crypto';

@Processor('message-status-updates')
export class MessageStatusProcessor extends WorkerHost {
  private readonly logger = new Logger(MessageStatusProcessor.name);

  constructor(
    private readonly messageStatusCreate: MessageStatusCreate,
    @Inject('MessageStatusRepository')
    private readonly messageStatusRepository: MessageStatusRepository,
  ) {
    super();
  }

  @OnWorkerEvent('active')
  onActive(job: Job) {
    this.logger.debug(`Processing status update: ${job.name}`);
  }

  @OnWorkerEvent('completed')
  onComplete(job: Job) {
    this.logger.debug(`Completed status update`);
  }

  @OnWorkerEvent('failed')
  onError(job: Job, error: any) {
    this.logger.error(`Failed status update: ${error.message}`);
  }

  async process(
    job: Job<MessageStatusUpdateJob | BatchStatusUpdateJob>,
  ): Promise<void> {
    try {
      if (job.name === 'update-status') {
        await this.processSingleStatusUpdate(
          job as Job<MessageStatusUpdateJob>,
        );
      } else if (job.name === 'batch-update-status') {
        await this.processBatchStatusUpdate(job as Job<BatchStatusUpdateJob>);
      }
    } catch (error) {
      this.logger.error(`Error processing status update: ${error.message}`);
      throw error;
    }
  }

  private async processSingleStatusUpdate(
    job: Job<MessageStatusUpdateJob>,
  ): Promise<void> {
    const { messageId, statusId, sessionId, timestamp } = job.data;
    try {
      const uuid = randomUUID();
      await this.messageStatusCreate.run(uuid, messageId, statusId, timestamp);

      // Status updated successfully (silent)
    } catch (error) {
      this.logger.error(
        `Failed to update status for message ${messageId}: ${error.message}`,
      );
      throw error;
    }
  }

  private async processBatchStatusUpdate(
    job: Job<BatchStatusUpdateJob>,
  ): Promise<void> {
    const { updates, batchId } = job.data;
    this.logger.log(
      `Processing batch ${batchId} with ${updates.length} status updates`,
    );

    const results = await Promise.allSettled(
      updates.map(async (update) => {
        const uuid = randomUUID();
        return this.messageStatusCreate.run(
          uuid,
          update.messageId,
          update.statusId,
          update.timestamp,
        );
      }),
    );

    const failures = results.filter((result) => result.status === 'rejected');
    const successes = results.filter((result) => result.status === 'fulfilled');

    this.logger.log(
      `Batch ${batchId} completed: ${successes.length} successes, ${failures.length} failures`,
    );

    if (failures.length > 0) {
      this.logger.warn(`Batch ${batchId} had ${failures.length} failures`, {
        failures: failures.map((failure, index) => ({
          updateIndex: index,
          error: failure.reason?.message,
        })),
      });
    }

    // If too many failures, reject the job for retry
    if (failures.length > updates.length * 0.5) {
      throw new Error(
        `Batch ${batchId} failed: too many individual failures (${failures.length}/${updates.length})`,
      );
    }
  }
}
