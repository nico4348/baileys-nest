import { Process, Processor } from '@nestjs/bull';
import { Injectable, Inject } from '@nestjs/common';
import { Job } from 'bull';
import { FileUploadJob } from './FileUploadQueue';
import { S3UploadService } from './S3UploadService';
import { SessionMediaRepository } from '../domain/SessionMediaRepository';
import { SessionMediaId } from '../domain/SessionMediaId';

@Processor('file-upload')
@Injectable()
export class FileUploadProcessor {
  constructor(
    private readonly s3UploadService: S3UploadService,
    @Inject('SessionMediaRepository') 
    private readonly sessionMediaRepository: SessionMediaRepository,
  ) {}

  @Process({
    name: 'upload-to-s3',
    concurrency: 5,
  })
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
      }
    } catch (error) {
      console.error(`Failed to upload file ${fileName}:`, error);
      throw error;
    }
  }
}