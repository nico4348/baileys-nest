import { MediaMessagesGetOneById } from './MediaMessagesGetOneById';

export class DownloadMediaMessage {
  constructor(
    private readonly mediaMessagesGetOneById: MediaMessagesGetOneById,
  ) {}

  async run(mediaMessageId: string): Promise<{ filePath: string; success: boolean }> {
    try {
      const mediaMessage = await this.mediaMessagesGetOneById.run(mediaMessageId);
      
      if (!mediaMessage) {
        throw new Error('Media message not found');
      }

      // Return the file path for download
      // In a real implementation, you might want to:
      // 1. Verify file exists
      // 2. Generate temporary download URL
      // 3. Handle different storage providers (S3, local, etc.)
      
      return {
        filePath: mediaMessage.file_path.value,
        success: true,
      };
    } catch (error) {
      console.error('Error downloading media:', error);
      throw error;
    }
  }
}
