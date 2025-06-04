import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Injectable, Inject, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { FileUploadJob } from './FileUploadQueue';
import { S3UploadService } from './S3UploadService';
import { SessionMediaRepository } from '../domain/SessionMediaRepository';
import { SessionMediaId } from '../domain/SessionMediaId';
import { FileStorage } from './FileStorage';

@Processor('file-upload')
export class FileUploadProcessor extends WorkerHost {
  private readonly logger = new Logger(FileUploadProcessor.name);

  constructor(
    private readonly s3UploadService: S3UploadService,
    @Inject('SessionMediaRepository') 
    private readonly sessionMediaRepository: SessionMediaRepository,
    private readonly fileStorage: FileStorage,
  ) {
    super();
  }

  @OnWorkerEvent('active')
  onActive(job: Job) {
    this.logger.log(`Processing job ${job.id} of type ${job.name}`);
  }

  @OnWorkerEvent('completed')
  onComplete(job: Job) {
    this.logger.log(`Completed job ${job.id} of type ${job.name}`);
  }

  @OnWorkerEvent('failed')
  onError(job: Job, error: any) {
    this.logger.error(`Failed job ${job.id} of type ${job.name}: ${error.message}`);
  }

  async process(job: Job<FileUploadJob>): Promise<void> {
    if (job.name !== 'upload-to-s3') return;
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
        
        // Clean up temporary file after successful upload
        await this.fileStorage.deleteTemporaryFile(sessionMediaId);
        this.logger.log(`Temporary file cleaned up for ${sessionMediaId}`);
      } else {
        throw new Error(`SessionMedia with ID ${sessionMediaId} not found`);
      }
    } catch (error) {
      this.logger.error(`Failed to upload file ${fileName}: ${error.message}`);
      // Clean up temporary file even on failure to prevent disk space issues
      await this.fileStorage.deleteTemporaryFile(sessionMediaId);
      throw error;
    }
  }
}