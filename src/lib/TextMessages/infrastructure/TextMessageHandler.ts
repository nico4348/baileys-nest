import { Injectable, Inject } from '@nestjs/common';
import { IMessageHandler } from '../../Messages/domain/interfaces/IMessageHandler';
import { TextMessagesCreate } from '../application/TextMessagesCreate';
import { TextMessageId } from '../domain/TextMessageId';
import { TextMessageMessageId } from '../domain/TextMessageMessageId';
import { TextMessageBody } from '../domain/TextMessageBody';

@Injectable()
export class TextMessageHandler implements IMessageHandler {
  constructor(
    @Inject('TextMessagesCreate')
    private readonly textMessagesCreate: TextMessagesCreate,
  ) {}
  async handle(messageId: string, sessionId: string, data: any): Promise<void> {
    const { text } = data;

    await this.textMessagesCreate.run(messageId, text);
  }
}
