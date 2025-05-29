import { IMessageHandler } from './IMessageHandler';

export interface IMessageHandlerFactory {
  getHandler(messageType: string): IMessageHandler;
}