import { Injectable } from '@nestjs/common';
import { MediaMessagesGetOneById } from './MediaMessagesGetOneById';
import { MediaMessagesUpdate } from './MediaMessagesUpdate';
import {
  S3MediaUploader,
  S3UploadResult,
} from '../infrastructure/S3MediaUploader';

export interface UploadToS3Result {
  success: boolean;
  s3Url?: string;
  s3Key?: string;
  error?: string;
}

@Injectable()
export class UploadMediaToS3 {
  constructor(
    private readonly mediaMessagesGetOneById: MediaMessagesGetOneById,
    private readonly mediaMessagesUpdate: MediaMessagesUpdate,
    private readonly s3MediaUploader: S3MediaUploader,
  ) {}

  async run(
    mediaMessageId: string,
    sessionId: string,
  ): Promise<UploadToS3Result> {
    try {
      const mediaMessage =
        await this.mediaMessagesGetOneById.run(mediaMessageId);

      if (!mediaMessage) {
        console.error(
          `❌ [UploadMediaToS3] Media message not found for ID: ${mediaMessageId}`,
        );
        throw new Error('Media message not found');
      }

      const localFilePath = mediaMessage.file_path.value;
      const messageId = mediaMessage.message_id.value;
      const mimeType = mediaMessage.mime_type?.value;

      const uploadResult: S3UploadResult =
        await this.s3MediaUploader.uploadFileToS3(
          localFilePath,
          sessionId,
          messageId,
          mimeType,
        );

      if (uploadResult.success && uploadResult.s3Url) {
        await this.mediaMessagesUpdate.run(
          mediaMessage.message_id.value,
          mediaMessage.caption?.value || null,
          mediaMessage.media_type.value,
          mediaMessage.mime_type?.value || '',
          mediaMessage.file_name.value,
          uploadResult.s3Url,
        );

        await this.s3MediaUploader.deleteTemporaryFile(localFilePath);

        return {
          success: true,
          s3Url: uploadResult.s3Url,
          s3Key: uploadResult.key,
        };
      } else {
        console.error(
          `❌ [UploadMediaToS3] S3 upload failed:`,
          uploadResult.error,
        );
        return {
          success: false,
          error: uploadResult.error || 'Upload failed',
        };
      }
    } catch (error) {
      console.error(`❌ [UploadMediaToS3] Error uploading media to S3:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
