import { MediaMessageRepository } from '../domain/MediaMessageRepository';
import { MediaMessage } from '../domain/MediaMessage';

export class MediaMessagesGetByMessageId {
  constructor(private readonly repository: MediaMessageRepository) {}
  
  async run(messageId: string): Promise<MediaMessage | null> {
    return this.repository.getByMessageId(messageId);
  }
}