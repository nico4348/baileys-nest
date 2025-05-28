import { MediaMessage } from '../domain/MediaMessage';
import { MediaMessageRepository } from '../domain/MediaMessageRepository';

export class MediaMessagesGetAll {
  constructor(private readonly repository: MediaMessageRepository) {}

  async run(): Promise<MediaMessage[]> {
    return this.repository.getAll();
  }
}
