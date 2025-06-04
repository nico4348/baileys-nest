import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

export interface FileUploadJob {
  sessionMediaId: string;
  fileBuffer: Buffer;
  fileName: string;
  mediaType: string;
  sessionId: string;
}

@Injectable()
export class FileUploadQueue {
  constructor(
    @InjectQueue('file-upload') public readonly uploadQueue: Queue,
  ) {}

  async addFileUpload(job: FileUploadJob): Promise<void> {
    await this.uploadQueue.add('upload-to-s3', job, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    });
  }
}