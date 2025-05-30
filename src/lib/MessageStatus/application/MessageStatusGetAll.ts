import { Injectable, Inject } from '@nestjs/common';
import { MessageStatus } from '../domain/MessageStatus';
import { MessageStatusRepository } from '../domain/MessageStatusRepository';

@Injectable()
export class MessageStatusGetAll {
  constructor(
    @Inject('MessageStatusRepository')
    private readonly repository: MessageStatusRepository,
  ) {}

  async run(): Promise<MessageStatus[]> {
    return this.repository.findAll();
  }
}
