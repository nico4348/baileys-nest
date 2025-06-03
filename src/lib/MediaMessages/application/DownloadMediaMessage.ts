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

  async run(mediaMessageId: string, sessionId: string, uploadToS3: boolean = false): Promise<DownloadMediaResult> {
    console.log(`📥 [DownloadMediaMessage] Starting download for mediaMessageId: ${mediaMessageId}, sessionId: ${sessionId}, uploadToS3: ${uploadToS3}`);
    
    try {
      console.log(`📥 [DownloadMediaMessage] Getting media message from database...`);
      const mediaMessage = await this.mediaMessagesGetOneById.run(mediaMessageId);
      
      if (!mediaMessage) {
        console.error(`❌ [DownloadMediaMessage] Media message not found for ID: ${mediaMessageId}`);
        throw new Error('Media message not found');
      }

      console.log(`📥 [DownloadMediaMessage] Media message found:`, {
        messageId: mediaMessage.message_id.value,
        mediaType: mediaMessage.media_type.value,
        fileName: mediaMessage.file_name.value,
        currentFilePath: mediaMessage.file_path.value
      });

      const result: DownloadMediaResult = {
        filePath: mediaMessage.file_path.value,
        success: true,
      };

      if (uploadToS3) {
        console.log(`☁️ [DownloadMediaMessage] Uploading to S3...`);
        const s3UploadResult = await this.uploadMediaToS3.run(mediaMessageId, sessionId);
        result.s3Upload = s3UploadResult;
        
        if (s3UploadResult.success && s3UploadResult.s3Url) {
          console.log(`✅ [DownloadMediaMessage] S3 upload successful: ${s3UploadResult.s3Url}`);
          result.filePath = s3UploadResult.s3Url;
        } else {
          console.error(`❌ [DownloadMediaMessage] S3 upload failed:`, s3UploadResult.error);
        }
      }

      console.log(`✅ [DownloadMediaMessage] Download completed successfully`);
      return result;
    } catch (error) {
      console.error(`❌ [DownloadMediaMessage] Error downloading media:`, error);
      throw error;
    }
  }
}
