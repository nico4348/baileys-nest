import { Injectable, Inject } from '@nestjs/common';
import { Message } from '../domain/Message';
import { MessageRepository } from '../domain/MessageRepository';
import { MessageSessionId } from '../domain/MessageSessionId';

@Injectable()
export class MessagesGetByBaileysId {
  constructor(
    @Inject('MessageRepository')
    private readonly repository: MessageRepository,
  ) {}

  async run(baileysMessageId: string, sessionId: string): Promise<Message | null> {
    return this.repository.findByBaileysId(baileysMessageId, new MessageSessionId(sessionId));
  }
}