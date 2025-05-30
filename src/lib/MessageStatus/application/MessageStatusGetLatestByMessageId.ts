import { Injectable, Inject } from '@nestjs/common';
import { MessageStatus } from '../domain/MessageStatus';
import { MessageStatusMessageId } from '../domain/MessageStatusMessageId';
import { MessageStatusRepository } from '../domain/MessageStatusRepository';
import { StatusRepository } from '../../Status/domain/StatusRepository';
import { StatusId } from '../../Status/domain/StatusId';

export interface MessageStatusWithStatusName {
  messageStatus: MessageStatus;
  statusName: string;
}

@Injectable()
export class MessageStatusGetLatestByMessageId {
  constructor(
    @Inject('MessageStatusRepository')
    private readonly messageStatusRepository: MessageStatusRepository,
    @Inject('StatusRepository')
    private readonly statusRepository: StatusRepository,
  ) {}

  async run(messageId: string): Promise<MessageStatusWithStatusName | null> {
    const messageStatus = await this.messageStatusRepository.findLatestByMessageId(
      new MessageStatusMessageId(messageId)
    );

    if (!messageStatus) {
      return null;
    }

    // Obtener el nombre del estado
    const status = await this.statusRepository.findById(new StatusId(messageStatus.status_id.value));
    if (!status) {
      return null;
    }

    return {
      messageStatus,
      statusName: status.name.value,
    };
  }
}