import { MessagesCreate } from './MessagesCreate';
import { MessageSender, ReactPayload } from '../domain/ports/MessageSender';
import { v4 as uuidv4 } from 'uuid';

export class MessagesSendReaction {
  constructor(
    private readonly messagesCreate: MessagesCreate,
    private readonly messageSender: MessageSender,
  ) {}

  async run(
    sessionId: string,
    to: string,
    messageKey: any,
    emoji: string,
    targetMessageId: string,
  ): Promise<{ messageId: string; success: boolean }> {
    try {
      const messageId = uuidv4();
      const payload: ReactPayload = { key: messageKey, emoji }; // Send reaction through Baileys
      const sentMessage = await this.messageSender.sendReactMessage(
        sessionId,
        `${to}@s.whatsapp.net`,
        payload,
      );

      if (sentMessage) {
        // Save message to database
        await this.messagesCreate.run(
          messageId,
          'out',
          'react',
          targetMessageId,
          sessionId,
          to,
          new Date(),
        );

        return { messageId, success: true };
      } else {
        throw new Error('Failed to send reaction through WhatsApp');
      }
    } catch (error) {
      console.error('Error sending reaction:', error);
      throw error;
    }
  }
}
