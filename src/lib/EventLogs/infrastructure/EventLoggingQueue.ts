import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

export interface EventLogJob {
  sessionId: string;
  eventId: string;
  eventData: Record<string, any>;
  timestamp: Date;
  priority?: 'high' | 'normal' | 'low';
  category: 'connection' | 'message' | 'system' | 'error';
}

export interface BatchEventLogJob {
  events: EventLogJob[];
  batchId: string;
  maxBatchSize: number;
  flushInterval: number;
}

@Injectable()
export class EventLoggingQueue {
  constructor(
    @InjectQueue('event-logging') 
    private readonly eventQueue: Queue,
  ) {}

  async addEventLog(job: EventLogJob): Promise<void> {
    const priority = this.getPriorityValue(job.priority || 'normal');

    await this.eventQueue.add('log-event', job, {
      priority,
      attempts: 2, // Less retries for logging to avoid overwhelming
      backoff: {
        type: 'fixed',
        delay: 3000,
      },
      removeOnComplete: 500,
      removeOnFail: 100,
      jobId: `event_${job.sessionId}_${job.eventId}_${Date.now()}`,
    });
  }

  async addEvent(job: EventLogJob): Promise<void> {
    return this.addEventLog(job);
  }

  async addBatchEvents(jobs: EventLogJob[]): Promise<void> {
    const batchJob: BatchEventLogJob = {
      events: jobs,
      batchId: `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      maxBatchSize: jobs.length,
      flushInterval: 30000, // 30 seconds
    };

    await this.eventQueue.add('batch-log-events', batchJob, {
      priority: 3, // Lower priority for batch operations
      attempts: 2,
      backoff: {
        type: 'fixed',
        delay: 5000,
      },
      removeOnComplete: 100,
      removeOnFail: 50,
    });
  }

  async addHighPriorityEvent(job: EventLogJob): Promise<void> {
    await this.eventQueue.add('log-event', { ...job, priority: 'high' }, {
      priority: 10, // Highest priority for critical events
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: 1000,
      removeOnFail: 200,
    });
  }

  async addSystemEvent(eventId: string, eventData: Record<string, any>): Promise<void> {
    await this.addEvent({
      sessionId: 'system',
      eventId,
      eventData,
      timestamp: new Date(),
      priority: 'high',
      category: 'system',
    });
  }

  async addPerformanceEvent(sessionId: string, eventData: Record<string, any>): Promise<void> {
    await this.addEvent({
      sessionId,
      eventId: 'performance_metric',
      eventData,
      timestamp: new Date(),
      priority: 'low',
      category: 'system',
    });
  }

  async addErrorEvent(sessionId: string, error: Error, context?: Record<string, any>): Promise<void> {
    await this.addHighPriorityEvent({
      sessionId,
      eventId: 'error_occurred',
      eventData: {
        error: error.message,
        stack: error.stack,
        context,
      },
      timestamp: new Date(),
      priority: 'high',
      category: 'error',
    });
  }

  async getQueueStats() {
    return {
      waiting: await this.eventQueue.getWaiting(),
      active: await this.eventQueue.getActive(),
      completed: await this.eventQueue.getCompleted(),
      failed: await this.eventQueue.getFailed(),
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