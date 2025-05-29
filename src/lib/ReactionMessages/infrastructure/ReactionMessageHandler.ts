import { Injectable, Inject } from '@nestjs/common';
import { IMessageHandler } from '../../Messages/domain/interfaces/IMessageHandler';
import { ReactionMessagesCreate } from '../application/ReactionMessagesCreate';

@Injectable()
export class ReactionMessageHandler implements IMessageHandler {
  constructor(
    @Inject('ReactionMessagesCreate')
    private readonly reactionMessagesCreate: ReactionMessagesCreate,
  ) {}

  async handle(messageId: string, sessionId: string, data: any): Promise<void> {
    const { emoji, targetMsgId } = data;
    
    await this.reactionMessagesCreate.run(
      crypto.randomUUID(),
      messageId,
      emoji,
      targetMsgId,
    );
  }
}