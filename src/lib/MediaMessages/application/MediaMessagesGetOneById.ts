import { MediaMessage } from '../domain/MediaMessage';
import { MediaMessageId } from '../domain/MediaMessageId';
import { MediaMessageRepository } from '../domain/MediaMessageRepository';

export class MediaMessagesGetOneById {
  constructor(private readonly repository: MediaMessageRepository) {}

  async run(id: string): Promise<MediaMessage | null> {
    return this.repository.getOneById(new MediaMessageId(id));
  }
}
