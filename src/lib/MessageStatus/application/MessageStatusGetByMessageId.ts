import { Injectable, Inject } from '@nestjs/common';
import { MessageStatus } from '../domain/MessageStatus';
import { MessageStatusMessageId } from '../domain/MessageStatusMessageId';
import { MessageStatusRepository } from '../domain/MessageStatusRepository';

@Injectable()
export class MessageStatusGetByMessageId {
  constructor(
    @Inject('MessageStatusRepository')
    private readonly repository: MessageStatusRepository,
  ) {}

  async run(messageId: string): Promise<MessageStatus[]> {
    return this.repository.findByMessageId(new MessageStatusMessageId(messageId));
  }
}