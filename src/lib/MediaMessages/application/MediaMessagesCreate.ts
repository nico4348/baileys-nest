import { MediaMessage } from '../domain/MediaMessage';
import { MediaMessageCaption } from '../domain/MediaMessageCaption';
import { MediaMessageFileName } from '../domain/MediaMessageFileName';
import { MediaMessageFilePath } from '../domain/MediaMessageFilePath';
import { MediaMessageId } from '../domain/MediaMessageId';
import { MediaMessageMediaType } from '../domain/MediaMessageMediaType';
import { MediaMessageMessageId } from '../domain/MediaMessageMessageId';
import { MediaMessageMimeType } from '../domain/MediaMessageMimeType';
import { MediaMessageRepository } from '../domain/MediaMessageRepository';
import {
  MediaStorageService,
  MediaUploadResult,
} from '../domain/ports/MediaStorageService';
import * as fs from 'fs';
import axios from 'axios';

export class MediaMessagesCreate {
  constructor(
    private readonly repository: MediaMessageRepository,
    private readonly storageService?: MediaStorageService,
  ) {}
  async run(
    messageId: string,
    caption: string | null,
    mediaType: string,
    mimeType: string,
    fileName: string,
    filePath: string,
    sessionId?: string,
  ): Promise<void> {
    // Primero crear el registro con el filePath original
    const mediaMessage = new MediaMessage(
      new MediaMessageMessageId(messageId),
      new MediaMessageCaption(caption),
      new MediaMessageMediaType(mediaType),
      new MediaMessageMimeType(mimeType),
      new MediaMessageFileName(fileName),
      new MediaMessageFilePath(filePath),
    );
    await this.repository.create(mediaMessage);

    if (this.storageService && sessionId) {
      try {
        let uploadResult: MediaUploadResult | null = null;

        console.log(`🔍 Processing media filePath: ${filePath}`);
        console.log(
          `📁 Media type: ${mediaType}, MIME: ${mimeType}, FileName: ${fileName}`,
        );

        const isUrl =
          filePath.startsWith('http://') || filePath.startsWith('https://');
        console.log(`🌐 Is URL: ${isUrl}`);

        if (isUrl) {
          console.log(`⬇️ Downloading media from URL: ${filePath}`);

          try {
            const response = await axios.get(filePath, {
              responseType: 'arraybuffer',
              timeout: 30000,
              headers: {
                'User-Agent':
                  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
              },
            });

            console.log(
              `✅ Media downloaded successfully, size: ${response.data.byteLength} bytes`,
            );
            const buffer = Buffer.from(response.data);
            console.log(`📦 Buffer created, size: ${buffer.length} bytes`);

            uploadResult = await this.storageService.uploadBuffer(
              buffer,
              fileName,
              sessionId,
              messageId,
              mediaType as 'image' | 'video' | 'audio' | 'document' | 'sticker',
              mimeType,
            );
          } catch (downloadError) {
            console.error(
              `❌ Error downloading media from URL:`,
              downloadError.message,
            );
          }
        } else if (fs.existsSync(filePath)) {
          console.log(`📁 Uploading local media to storage: ${filePath}`);

          uploadResult = await this.storageService.uploadFromPath(
            filePath,
            sessionId,
            messageId,
            mediaType as 'image' | 'video' | 'audio' | 'document' | 'sticker',
          );
        } else {
          console.warn(`Local file not found for upload: ${filePath}`);
        }

        if (uploadResult?.success) {
          const updatedMediaMessage = new MediaMessage(
            new MediaMessageMessageId(messageId),
            new MediaMessageCaption(caption),
            new MediaMessageMediaType(mediaType),
            new MediaMessageMimeType(mimeType),
            new MediaMessageFileName(fileName),
            new MediaMessageFilePath(uploadResult.url),
          );
          await this.repository.update(updatedMediaMessage);
          console.log(
            `FilePath updated in database with storage URL: ${uploadResult.url}`,
          );
        } else if (uploadResult?.error) {
          console.error(`❌ Storage upload failed: ${uploadResult.error}`);
        }
      } catch (error) {
        console.error('Error uploading media to storage:', error);
      }
    }
  }
}
