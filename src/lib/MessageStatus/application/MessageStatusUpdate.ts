import { MessageStatusId } from '../domain/MessageStatusId';
import { MessageStatusMessageId } from '../domain/MessageStatusMessageId';
import { MessageStatusRepository } from '../domain/MessageStatusRepository';
import { MessageStatus } from '../domain/MessageStatus';
import { MessageStatusStatusId } from '../domain/MessageStatusStatusId';
import { MessageStatusUpdatedAt } from '../domain/MessageStatusUpdatedAt';

export class MessageStatusUpdate {
  constructor(private readonly repository: MessageStatusRepository) {}
  async run(
    id: string,
    messageId: string,
    statusId: string,
    updatedAt: Date,
  ): Promise<void> {
    const messageStatus = new MessageStatus(
      new MessageStatusId(id),
      new MessageStatusMessageId(messageId),
      new MessageStatusStatusId(statusId),
      new MessageStatusUpdatedAt(updatedAt),
    );

    await this.repository.update(messageStatus);
  }
}
