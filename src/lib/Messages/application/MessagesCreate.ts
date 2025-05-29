import { MessageId } from '../domain/MessageId';
import { MessageRepository } from '../domain/MessageRepository';
import { Message } from '../domain/Message';
import { MessageMessageType } from '../domain/MessageMessageType';
import { MessageQuotedMessageId } from '../domain/MessageQuotedMessageId';
import { MessageSessionId } from '../domain/MessageSessionId';
import { MessageTo } from '../domain/MessageTo';
import { MessageCreatedAt } from '../domain/MessageCreatedAt';
import { MessageBaileysId } from '../domain/MessageBaileysId';

export class MessagesCreate {
  constructor(private readonly repository: MessageRepository) {}
  async run(
    id: string,
    baileysId: string | null,
    messageType: 'txt' | 'media' | 'react',
    quotedMessageId: string | null,
    sessionId: string,
    to: string,
    createdAt: Date,
  ): Promise<void> {
    const message = new Message(
      new MessageId(id),
      new MessageBaileysId(baileysId),
      new MessageSessionId(sessionId),
      new MessageQuotedMessageId(quotedMessageId),
      new MessageTo(to),
      new MessageMessageType(messageType),
      new MessageCreatedAt(createdAt),
    );
    await this.repository.create(message);
  }
}
