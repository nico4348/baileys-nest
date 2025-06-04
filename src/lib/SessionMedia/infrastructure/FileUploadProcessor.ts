import { Process, Processor, OnQueueActive, OnQueueCompleted, OnQueueFailed } from '@nestjs/bull';
import { Injectable, Inject, Logger } from '@nestjs/common';
import { Job } from 'bull';
import { FileUploadJob } from './FileUploadQueue';
import { S3UploadService } from './S3UploadService';
import { SessionMediaRepository } from '../domain/SessionMediaRepository';
import { SessionMediaId } from '../domain/SessionMediaId';

@Injectable()
@Processor('file-upload')
export class FileUploadProcessor {
  private readonly logger = new Logger(FileUploadProcessor.name);

  constructor(
    private readonly s3UploadService: S3UploadService,
    @Inject('SessionMediaRepository') 
    private readonly sessionMediaRepository: SessionMediaRepository,
  ) {}

  @OnQueueActive()
  onActive(job: Job) {
    this.logger.log(`Processing job ${job.id} of type ${job.name}`);
  }

  @OnQueueCompleted()
  onComplete(job: Job) {
    this.logger.log(`Completed job ${job.id} of type ${job.name}`);
  }

  @OnQueueFailed()
  onError(job: Job, error: any) {
    this.logger.error(`Failed job ${job.id} of type ${job.name}: ${error.message}`);
  }

  @Process('upload-to-s3')
  async handleFileUpload(job: Job<FileUploadJob>): Promise<void> {
    const { sessionMediaId, fileBuffer, fileName, mediaType, sessionId } = job.data;
    
    try {
      const uploadResult = await this.s3UploadService.uploadFile({
        file: fileBuffer,
        fileName,
        mediaType,
        sessionId,
      });

      const sessionMedia = await this.sessionMediaRepository.findById(
        new SessionMediaId(sessionMediaId)
      );

      if (sessionMedia) {
        const updatedSessionMedia = sessionMedia
          .updateS3Url(uploadResult.s3Url)
          .markAsUploaded();

        await this.sessionMediaRepository.update(updatedSessionMedia);
      } else {
        throw new Error(`SessionMedia with ID ${sessionMediaId} not found`);
      }
    } catch (error) {
      this.logger.error(`Failed to upload file ${fileName}: ${error.message}`);
      throw error;
    }
  }
}