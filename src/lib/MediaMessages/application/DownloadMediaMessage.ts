import { Injectable } from '@nestjs/common';
import { MediaMessagesGetOneById } from './MediaMessagesGetOneById';
import { UploadMediaToS3, UploadToS3Result } from './UploadMediaToS3';

export interface DownloadMediaResult {
  filePath: string;
  success: boolean;
  s3Upload?: UploadToS3Result;
}

@Injectable()
export class DownloadMediaMessage {
  constructor(
    private readonly mediaMessagesGetOneById: MediaMessagesGetOneById,
    private readonly uploadMediaToS3: UploadMediaToS3,
  ) {}

  async run(
    mediaMessageId: string,
    sessionId: string,
    uploadToS3: boolean = false,
  ): Promise<DownloadMediaResult> {
    try {
      const mediaMessage =
        await this.mediaMessagesGetOneById.run(mediaMessageId);

      if (!mediaMessage) {
        console.error(
          `❌ [DownloadMediaMessage] Media message not found for ID: ${mediaMessageId}`,
        );
        throw new Error('Media message not found');
      }

      const result: DownloadMediaResult = {
        filePath: mediaMessage.file_path.value,
        success: true,
      };

      if (uploadToS3) {
        const s3UploadResult = await this.uploadMediaToS3.run(
          mediaMessageId,
          sessionId,
        );
        result.s3Upload = s3UploadResult;

        if (s3UploadResult.success && s3UploadResult.s3Url) {
          result.filePath = s3UploadResult.s3Url;
        } else {
          console.error(
            `❌ [DownloadMediaMessage] S3 upload failed:`,
            s3UploadResult.error,
          );
        }
      }

      return result;
    } catch (error) {
      console.error(
        `❌ [DownloadMediaMessage] Error downloading media:`,
        error,
      );
      throw error;
    }
  }
}
