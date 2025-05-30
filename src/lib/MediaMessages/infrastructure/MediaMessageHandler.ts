import { Injectable, Inject } from '@nestjs/common';
import { IMessageHandler } from '../../Messages/domain/interfaces/IMessageHandler';
import { MediaMessagesCreate } from '../application/MediaMessagesCreate';

@Injectable()
export class MediaMessageHandler implements IMessageHandler {
  constructor(
    @Inject('MediaMessagesCreate')
    private readonly mediaMessagesCreate: MediaMessagesCreate,
  ) {}
  async handle(messageId: string, sessionId: string, data: any): Promise<void> {
    const { caption, mediaType, mimeType, fileName, filePath } = data;

    await this.mediaMessagesCreate.run(
      messageId,
      caption || '',
      mediaType,
      mimeType,
      fileName,
      filePath,
    );
  }
}
