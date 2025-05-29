import { Injectable, Inject } from '@nestjs/common';
import { IMessageHandlerFactory } from '../domain/interfaces/IMessageHandlerFactory';
import { IMessageHandler } from '../domain/interfaces/IMessageHandler';

@Injectable()
export class MessageHandlerFactory implements IMessageHandlerFactory {
  constructor(
    @Inject('TextMessageHandler')
    private readonly textHandler: IMessageHandler,
    @Inject('MediaMessageHandler')
    private readonly mediaHandler: IMessageHandler,
    @Inject('ReactionMessageHandler')
    private readonly reactionHandler: IMessageHandler,
  ) {}

  getHandler(messageType: string): IMessageHandler {
    switch (messageType) {
      case 'text':
        return this.textHandler;
      case 'media':
        return this.mediaHandler;
      case 'reaction':
        return this.reactionHandler;
      default:
        throw new Error(`Unknown message type: ${messageType}`);
    }
  }
}