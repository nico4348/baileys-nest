import { MediaMessageRepository } from '../domain/MediaMessageRepository';
import { MediaMessage } from '../domain/MediaMessage';

export class MediaMessagesGetByMediaType {
  constructor(private readonly repository: MediaMessageRepository) {}
  
  async run(mediaType: string): Promise<MediaMessage[]> {
    return this.repository.getByMediaType(mediaType);
  }
}