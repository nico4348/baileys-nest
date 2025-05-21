import { MediaMessage } from '../domain/MediaMessage';
import { MediaMessageRepository } from '../domain/MediaMessageRepository';

export class MediaMessageGetAll {
  constructor(private readonly repository: MediaMessageRepository) {}

  async run(): Promise<MediaMessage[]> {
    return this.repository.getAll();
  }
}
