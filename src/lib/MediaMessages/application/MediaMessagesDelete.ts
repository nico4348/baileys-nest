import { MediaMessageId } from '../domain/MediaMessageId';
import { MediaMessageRepository } from '../domain/MediaMessageRepository';

export class MediaMessageDelete {
  constructor(private readonly repository: MediaMessageRepository) {}

  async run(id: string): Promise<void> {
    return this.repository.delete(new MediaMessageId(id));
  }
}
