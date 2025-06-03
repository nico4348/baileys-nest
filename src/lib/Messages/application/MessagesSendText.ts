import { MessagesCreate } from './MessagesCreate';
import { MessageSender, TextPayload } from '../domain/ports/MessageSender';
import { v4 as uuidv4 } from 'uuid';

export class MessagesSendText {
  constructor(
    private readonly messagesCreate: MessagesCreate,
    private readonly messageSender: MessageSender,
  ) {}

  async run(
    sessionId: string,
    to: string,
    text: string,
    quotedMessageId?: Record<string, any>,
  ): Promise<{ messageId: string; success: boolean }> {
    try {
      const messageId = uuidv4();
      const payload: TextPayload = { text }; // Send message through Baileys
      const sentMessage = await this.messageSender.sendTextMessage(
        sessionId,
        `${to}@s.whatsapp.net`,
        payload,
        quotedMessageId ? quotedMessageId : undefined,
      );
      if (sentMessage) {
        // Save message to database
        await this.messagesCreate.run(
          messageId,
          sentMessage, // Complete Baileys message object as JSON
          'txt',
          quotedMessageId ? JSON.stringify(quotedMessageId) : null,
          sessionId,
          to,
          true, // fromMe: true for outgoing messages
          new Date(),
        );

        return { messageId, success: true };
      } else {
        throw new Error('Failed to send message through WhatsApp');
      }
    } catch (error) {
      console.error('Error sending text message:', error);
      throw error;
    }
  }
}
