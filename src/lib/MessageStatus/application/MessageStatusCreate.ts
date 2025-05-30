import { Injectable, Inject } from '@nestjs/common';
import { MessageStatusId } from '../domain/MessageStatusId';
import { MessageStatusMessageId } from '../domain/MessageStatusMessageId';
import { MessageStatusRepository } from '../domain/MessageStatusRepository';
import { MessageStatus } from '../domain/MessageStatus';
import { MessageStatusStatusId } from '../domain/MessageStatusStatusId';
import { MessageStatusCreatedAt } from '../domain/MessageStatusCreatedAt';

@Injectable()
export class MessageStatusCreate {
  constructor(
    @Inject('MessageStatusRepository')
    private readonly repository: MessageStatusRepository,
  ) {}
  async run(
    id: string,
    messageId: string,
    statusId: string,
    createdAt: Date,
  ): Promise<void> {
    const messageStatus = new MessageStatus(
      new MessageStatusId(id),
      new MessageStatusMessageId(messageId),
      new MessageStatusStatusId(statusId),
      new MessageStatusCreatedAt(createdAt),
    );

    await this.repository.save(messageStatus);
  }
}
