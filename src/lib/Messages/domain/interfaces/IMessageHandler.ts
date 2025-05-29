export interface IMessageHandler {
  handle(messageId: string, sessionId: string, data: any): Promise<void>;
}