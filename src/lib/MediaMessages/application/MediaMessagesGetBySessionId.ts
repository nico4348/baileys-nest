import { MediaMessageRepository } from '../domain/MediaMessageRepository';
import { MediaMessage } from '../domain/MediaMessage';

export class MediaMessagesGetBySessionId {
  constructor(private readonly repository: MediaMessageRepository) {}
  
  async run(sessionId: string): Promise<MediaMessage[]> {
    return this.repository.getBySessionId(sessionId);
  }
}