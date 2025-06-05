import { Injectable } from '@nestjs/common';
import { proto, type WASocket, delay } from 'baileys';
import { WhatsAppSessionManager } from '../../Sessions/infrastructure/WhatsAppSessionManager';
import { MessageStatusTrackSentMessage } from '../../MessageStatus/application/MessageStatusTrackSentMessage';
import {
  MessageSender,
  TextPayload,
  MediaPayload,
  ReactPayload,
} from '../domain/ports/MessageSender';

@Injectable()
export class BaileysMessageSender implements MessageSender {
  constructor(
    private readonly sessionManager: WhatsAppSessionManager,
    private readonly messageStatusTracker?: MessageStatusTrackSentMessage,
  ) {}

  private getSocket(sessionId: string): WASocket | null {
    return this.sessionManager.getSocket(sessionId);
  }

  async sendTextMessage(
    sessionId: string,
    jid: string,
    payload: TextPayload,
    quoted?: Record<string, any>,
  ): Promise<proto.WebMessageInfo | null> {
    let opts = {};
    if (quoted) {
      opts = {
        quoted: quoted.key ? quoted : { key: quoted },
      };
    }
    try {
      const sock = this.getSocket(sessionId);
      if (!sock) {
        throw new Error(`Session ${sessionId} not found or not connected`);
      }

      const { text } = payload;
      if (!text || text.trim().length === 0) {
        throw new Error('Text message cannot be empty');
      }

      // Set online presence first
      await this.setOnlinePresence(sessionId, jid);
      await delay(500);

      await sock.sendPresenceUpdate('composing', jid);
      await delay(2000);

      await sock.sendPresenceUpdate('paused', jid);

      const msg = await sock.sendMessage(jid, { text }, opts);

      return msg || null;
    } catch (error) {
      console.error(`Error sending text message to ${jid}:`, error);
      throw error;
    }
  }

  async sendMediaMessage(
    sessionId: string,
    jid: string,
    mediaType: string,
    payload: MediaPayload,
    quoted?: Record<string, any>,
  ): Promise<proto.WebMessageInfo | null> {
    let opts = {};
    if (quoted) {
      opts = {
        quoted: quoted.key ? quoted : { key: quoted },
      };
    }
    try {
      const sock = this.getSocket(sessionId);
      if (!sock) throw new Error(`Session ${sessionId} not found`);

      const { url, caption } = payload;
      if (!url) throw new Error('Media URL is required');

      let msg: proto.WebMessageInfo | null;

      switch (mediaType) {
        case 'voiceNote':
          msg =
            (await sock.sendMessage(
              jid,
              { audio: payload, ptt: true },
              opts,
            )) || null;
          break;
        case 'audio':
          msg = (await sock.sendMessage(jid, { audio: payload }, opts)) || null;
          break;
        case 'video':
          msg =
            (await sock.sendMessage(jid, { video: payload, caption }, opts)) ||
            null;
          break;
        case 'image':
          msg =
            (await sock.sendMessage(jid, { image: payload, caption }, opts)) ||
            null;
          break;
        case 'sticker':
          msg =
            (await sock.sendMessage(jid, { sticker: payload }, opts)) || null;
          break;
        case 'document':
          msg =
            (await sock.sendMessage(
              jid,
              {
                document: payload,
                mimetype: payload.mime_type,
                fileName: payload.file_name,
                caption,
              },
              opts,
            )) || null;
          break;
        default:
          throw new Error(`Unsupported media type '${mediaType}'`);
      }

      // Track message status if tracker is available and message was sent
      // Note: Status tracking happens after message is stored in DB via MessageStatusTracker

      return msg;
    } catch (error) {
      console.error(`Error sending ${mediaType} to ${jid}:`, error);
      throw error;
    }
  }
  async sendReactMessage(
    sessionId: string,
    jid: string,
    payload: ReactPayload,
  ): Promise<proto.WebMessageInfo | null> {
    try {
      const sock = this.getSocket(sessionId);
      if (!sock) {
        throw new Error(`Session ${sessionId} not found or not connected`);
      }

      const { key, emoji } = payload;

      if (!key || !emoji) {
        throw new Error('Message key and emoji are required for reactions');
      }

      const msg = await sock.sendMessage(jid, {
        react: { key: key, text: emoji },
      });

      // Track message status if tracker is available and message was sent
      // Note: Status tracking happens after message is stored in DB via MessageStatusTracker

      return msg || null;
    } catch (error) {
      console.error(`Error sending reaction to ${jid}:`, error);
      throw error;
    }
  }

  async setOnlinePresence(sessionId: string, jid?: string): Promise<void> {
    try {
      const sock = this.getSocket(sessionId);
      if (!sock) {
        throw new Error(`Session ${sessionId} not found or not connected`);
      }

      // Set general online presence
      await sock.sendPresenceUpdate('available');

      // If specific chat is provided, subscribe and set presence for that chat
      if (jid) {
        await sock.presenceSubscribe(jid);
        await sock.sendPresenceUpdate('available', jid);
      }

      console.log(
        `✅ [${sessionId}] Set online presence${jid ? ` for ${jid}` : ' globally'}`,
      );
    } catch (error) {
      console.error(
        `Error setting online presence for session ${sessionId}:`,
        error,
      );
      throw error;
    }
  }

  async setOfflinePresence(sessionId: string, jid?: string): Promise<void> {
    try {
      const sock = this.getSocket(sessionId);
      if (!sock) {
        throw new Error(`Session ${sessionId} not found or not connected`);
      }

      // Set general offline presence
      await sock.sendPresenceUpdate('unavailable');

      // If specific chat is provided, set presence for that chat
      if (jid) {
        await sock.sendPresenceUpdate('unavailable', jid);
      }

      console.log(
        `🔴 [${sessionId}] Set offline presence${jid ? ` for ${jid}` : ' globally'}`,
      );
    } catch (error) {
      console.error(
        `Error setting offline presence for session ${sessionId}:`,
        error,
      );
      throw error;
    }
  }
}
