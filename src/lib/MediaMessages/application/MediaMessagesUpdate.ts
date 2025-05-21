import { MediaMessage } from '../domain/MediaMessage';
import { MediaMessageCaption } from '../domain/MediaMessageCaption';
import { MediaMessageFileName } from '../domain/MediaMessageFileName';
import { MediaMessageFilePath } from '../domain/MediaMessageFilePath';
import { MediaMessageId } from '../domain/MediaMessageId';
import { MediaMessageMediaType } from '../domain/MediaMessageMediaType';
import { MediaMessageMessageId } from '../domain/MediaMessageMessageId';
import { MediaMessageMimeType } from '../domain/MediaMessageMimeType';
import { MediaMessageRepository } from '../domain/MediaMessageRepository';

export class MediaMessageUpdate {
  constructor(private readonly repository: MediaMessageRepository) {}
  async run(
    id: string,
    messageId: string,
    caption: string,
    mediaType: 'image' | 'video' | 'audio' | 'docs',
    mimeType: string,
    fileName: string,
    filePath: string,
  ): Promise<void> {
    const mediaMessage = new MediaMessage(
      new MediaMessageId(id),
      new MediaMessageMessageId(messageId),
      new MediaMessageCaption(caption),
      new MediaMessageMediaType(mediaType),
      new MediaMessageMimeType(mimeType),
      new MediaMessageFileName(fileName),
      new MediaMessageFilePath(filePath),
    );
    await this.repository.update(mediaMessage);
  }
}
