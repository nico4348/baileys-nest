import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export interface PresignedUrlRequest {
  fileName: string;
  mediaType: string;
  sessionId: string;
}

export interface PresignedUrlResponse {
  uploadUrl: string;
  s3Key: string;
  s3Url: string;
}

@Injectable()
export class S3PresignedUrlService {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;

  constructor() {
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
    
    if (!accessKeyId || !secretAccessKey) {
      throw new Error('AWS credentials are required: AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY');
    }

    this.s3Client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
    this.bucketName = process.env.S3_BUCKET_NAME || 'baileys-nest-media';
  }

  async generatePresignedUrl(request: PresignedUrlRequest): Promise<PresignedUrlResponse> {
    const timestamp = Date.now();
    const s3Key = `session-media/${request.sessionId}/${timestamp}-${request.fileName}`;
    
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: s3Key,
      ContentType: request.mediaType,
    });

    const uploadUrl = await getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
    const s3Url = `https://${this.bucketName}.s3.amazonaws.com/${s3Key}`;

    return {
      uploadUrl,
      s3Key,
      s3Url,
    };
  }
}