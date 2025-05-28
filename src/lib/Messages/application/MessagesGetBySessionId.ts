import { MessageRepository } from '../domain/MessageRepository';
import { Message } from '../domain/Message';

export class MessagesGetBySessionId {
  constructor(private readonly repository: MessageRepository) {}
  
  async run(sessionId: string): Promise<Message[]> {
    return this.repository.getBySessionId(sessionId);
  }
}