export interface IMessageSender {
  sendText(to: string, text: string): Promise<any>;
  sendMedia(to: string, media: any, caption?: string): Promise<any>;
  sendReaction(to: string, messageKey: any, emoji: string): Promise<any>;
}