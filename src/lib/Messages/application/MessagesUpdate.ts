import { MessageId } from '../domain/MessageId';
import { MessageRepository } from '../domain/MessageRepository';
import { Message } from '../domain/Message';
import { MessageInOut } from '../domain/MessageInOut';
import { MessageMessageType } from '../domain/MessageMessageType';
import { MessageQuotedMessageId } from '../domain/MessageQuotedMessageId';
import { MessageSessionId } from '../domain/MessageSessionId';
import { MessageTo } from '../domain/MessageTo';
import { MessageCreatedAt } from '../domain/MessageCreatedAt';

export class MessageUpdate {
  constructor(private readonly repository: MessageRepository) {}
  async run(
    id: string,
    inOut: 'in' | 'out',
    messageType: 'txt' | 'media' | 'react',
    quotedMessageId: string,
    sessionId: string,
    to: string,
    createdAt: Date,
  ): Promise<void> {
    const message = new Message(
      new MessageId(id),
      new MessageSessionId(sessionId),
      new MessageQuotedMessageId(quotedMessageId),
      new MessageTo(to),
      new MessageMessageType(messageType),
      new MessageInOut(inOut),
      new MessageCreatedAt(createdAt),
    );
    await this.repository.update(message);
  }
}
