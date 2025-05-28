import { TextMessageRepository } from '../domain/TextMessageRepository';
import { TextMessage } from '../domain/TextMessage';

export class TextMessagesGetBySessionId {
  constructor(private readonly repository: TextMessageRepository) {}
  
  async run(sessionId: string): Promise<TextMessage[]> {
    return this.repository.getBySessionId(sessionId);
  }
}