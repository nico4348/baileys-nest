import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

export interface S3UploadRequest {
  file: Buffer;
  fileName: string;
  mediaType: string;
  sessionId: string;
}

export interface S3UploadResponse {
  s3Key: string;
  s3Url: string;
}

@Injectable()
export class S3UploadService {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;

  constructor() {
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

    if (!accessKeyId || !secretAccessKey) {
      throw new Error(
        'AWS credentials are required: AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY',
      );
    }

    this.s3Client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
    this.bucketName = process.env.AWS_S3_BUCKET_NAME || 'default-bucket';
  }

  async uploadFile(request: S3UploadRequest): Promise<S3UploadResponse> {
    const timestamp = Date.now();
    const s3Key = `session-media/${request.sessionId}/${timestamp}-${request.fileName}`;

    // Ensure we have a proper Buffer
    let fileBuffer: Buffer;
    if (Buffer.isBuffer(request.file)) {
      fileBuffer = request.file;
    } else if (
      request.file &&
      typeof request.file === 'object' &&
      (request.file as any).type === 'Buffer'
    ) {
      // Handle serialized Buffer from Redis
      fileBuffer = Buffer.from((request.file as any).data);
    } else {
      throw new Error('Invalid file data received');
    }

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: s3Key,
      Body: fileBuffer,
      ContentType: request.mediaType,
      ContentLength: fileBuffer.length,
    });

    await this.s3Client.send(command);
    const s3Url = `https://${this.bucketName}.s3.amazonaws.com/${s3Key}`;

    return {
      s3Key,
      s3Url,
    };
  }
}
