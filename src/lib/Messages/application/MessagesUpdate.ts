import { MessageId } from '../domain/MessageId';
import { MessageRepository } from '../domain/MessageRepository';
import { Message } from '../domain/Message';
import { MessageMessageType } from '../domain/MessageMessageType';
import { MessageQuotedMessageId } from '../domain/MessageQuotedMessageId';
import { MessageSessionId } from '../domain/MessageSessionId';
import { MessageTo } from '../domain/MessageTo';
import { MessageCreatedAt } from '../domain/MessageCreatedAt';
import { MessageBaileysJson } from '../domain/MessageBaileysJson';
import { MessageFromMe } from '../domain/MessageFromMe';

export class MessagesUpdate {
  constructor(private readonly repository: MessageRepository) {}
  async run(
    id: string,
    baileysJson: any,
    messageType: 'txt' | 'media' | 'react',
    quotedMessageId: string | null,
    sessionId: string,
    to: string,
    fromMe: boolean,
    createdAt: Date,
  ): Promise<void> {
    const message = new Message(
      new MessageId(id),
      new MessageBaileysJson(baileysJson),
      new MessageSessionId(sessionId),
      new MessageQuotedMessageId(quotedMessageId),
      new MessageTo(to),
      new MessageMessageType(messageType),
      new MessageFromMe(fromMe),
      new MessageCreatedAt(createdAt),
    );
    await this.repository.update(message);
  }
}
