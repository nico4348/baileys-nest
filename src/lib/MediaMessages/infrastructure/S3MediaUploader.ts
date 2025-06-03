import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import * as fs from 'fs/promises';
import * as path from 'path';
import {
  MediaStorageService,
  MediaUploadResult,
} from '../domain/ports/MediaStorageService';

export interface S3UploadResult {
  success: boolean;
  s3Url?: string;
  key?: string;
  error?: string;
}

export interface S3Config {
  region: string;
  bucketName: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  endpoint?: string;
}

@Injectable()
export class S3MediaUploader implements MediaStorageService {
  private s3Client: S3Client;
  private bucketName: string;

  constructor() {
    const config = this.getS3Config();
    this.bucketName = config.bucketName;

    this.s3Client = new S3Client({
      region: config.region,
      credentials:
        config.accessKeyId && config.secretAccessKey
          ? {
              accessKeyId: config.accessKeyId,
              secretAccessKey: config.secretAccessKey,
            }
          : undefined,
      endpoint: config.endpoint,
    });
  }
  private getS3Config(): S3Config {
    return {
      region: process.env.AWS_REGION || 'us-east-1',
      bucketName: process.env.AWS_S3_BUCKET_NAME || 'baileys-media-bucket',
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      endpoint: process.env.S3_ENDPOINT,
    };
  }

  private generateS3Key(
    sessionId: string,
    messageId: string,
    originalFileName: string,
  ): string {
    const timestamp = new Date().toISOString().split('T')[0];
    const fileExtension = path.extname(originalFileName);
    const sanitizedFileName = path
      .basename(originalFileName, fileExtension)
      .replace(/[^a-zA-Z0-9-_]/g, '');

    return `media/${sessionId}/${timestamp}/${messageId}_${sanitizedFileName}${fileExtension}`;
  }

  async uploadFileToS3(
    filePath: string,
    sessionId: string,
    messageId: string,
    mimeType?: string,
  ): Promise<S3UploadResult> {
    console.log(`🪣 [S3MediaUploader] Starting file upload to S3:`, {
      filePath,
      sessionId,
      messageId,
      mimeType,
      bucketName: this.bucketName,
    });

    try {
      console.log(`🪣 [S3MediaUploader] Reading file from path: ${filePath}`);
      const fileBuffer = await fs.readFile(filePath);
      console.log(
        `🪣 [S3MediaUploader] File read successfully, size: ${fileBuffer.length} bytes`,
      );

      const originalFileName = path.basename(filePath);
      const s3Key = this.generateS3Key(sessionId, messageId, originalFileName);

      console.log(`🪣 [S3MediaUploader] Generated S3 key: ${s3Key}`);

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: s3Key,
        Body: fileBuffer,
        ContentType: mimeType || 'application/octet-stream',
        Metadata: {
          sessionId,
          messageId,
          originalFileName,
          uploadedAt: new Date().toISOString(),
        },
      });

      console.log(`🪣 [S3MediaUploader] Sending file to S3...`);
      await this.s3Client.send(command);
      console.log(`🪣 [S3MediaUploader] File uploaded successfully to S3`);

      const s3Url = `https://${this.bucketName}.s3.${this.getS3Config().region}.amazonaws.com/${s3Key}`;
      console.log(`🪣 [S3MediaUploader] Generated S3 URL: ${s3Url}`);

      return {
        success: true,
        s3Url,
        key: s3Key,
      };
    } catch (error) {
      console.error(`❌ [S3MediaUploader] Error uploading to S3:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async deleteTemporaryFile(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath);
      console.log(`Temporary file deleted: ${filePath}`);
    } catch (error) {
      console.error(`Error deleting temporary file ${filePath}:`, error);
    }
  }

  async uploadBuffer(
    buffer: Buffer,
    fileName: string,
    sessionId: string,
    messageId: string,
    mediaType: 'image' | 'video' | 'audio' | 'document' | 'sticker',
    mimeType?: string,
  ): Promise<MediaUploadResult> {
    try {
      const s3Key = this.generateS3Key(sessionId, messageId, fileName);

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: s3Key,
        Body: buffer,
        ContentType: mimeType || 'application/octet-stream',
        Metadata: {
          sessionId,
          messageId,
          mediaType,
          originalFileName: fileName,
          uploadedAt: new Date().toISOString(),
        },
      });

      await this.s3Client.send(command);

      const s3Url = `https://${this.bucketName}.s3.${this.getS3Config().region}.amazonaws.com/${s3Key}`;

      return {
        success: true,
        url: s3Url,
        key: s3Key,
      };
    } catch (error) {
      console.error('Error uploading buffer to S3:', error);
      return {
        success: false,
        url: '',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async uploadFromPath(
    filePath: string,
    sessionId: string,
    messageId: string,
    mediaType: 'image' | 'video' | 'audio' | 'document' | 'sticker',
  ): Promise<MediaUploadResult> {
    try {
      const fileBuffer = await fs.readFile(filePath);
      const originalFileName = path.basename(filePath);

      const mimeType = this.getMimeTypeFromExtension(
        path.extname(originalFileName),
      );

      return await this.uploadBuffer(
        fileBuffer,
        originalFileName,
        sessionId,
        messageId,
        mediaType,
        mimeType,
      );
    } catch (error) {
      console.error('Error uploading from path to S3:', error);
      return {
        success: false,
        url: '',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async deleteMedia(keys: string[]): Promise<boolean> {
    // Implementation would use S3 DeleteObjects command
    // For now, returning true as placeholder
    console.log(`Would delete S3 keys: ${keys.join(', ')}`);
    return true;
  }

  private getMimeTypeFromExtension(extension: string): string {
    const mimeTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.mp4': 'video/mp4',
      '.mp3': 'audio/mpeg',
      '.ogg': 'audio/ogg',
      '.pdf': 'application/pdf',
      '.txt': 'text/plain',
    };

    return mimeTypes[extension.toLowerCase()] || 'application/octet-stream';
  }
}
