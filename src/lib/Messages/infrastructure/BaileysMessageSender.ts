import { Injectable } from '@nestjs/common';
import { proto, type WASocket } from 'baileys';
import * as path from 'path';
import { lookup } from 'mime-types';
import { WhatsAppSessionManager } from '../../Sessions/infrastructure/WhatsAppSessionManager';

export interface TextPayload {
  text: string;
  quoted?: any;
}

export interface MediaPayload {
  url: string;
  caption?: string;
  media_type?: string;
  mime_type: string;
  file_name?: string;
  file_path?: string;
}

export interface ReactPayload {
  key: any;
  emoji: string;
}

@Injectable()
export class BaileysMessageSender {
  constructor(private readonly sessionManager: WhatsAppSessionManager) {}

  private getSocket(sessionId: string): WASocket | null {
    return this.sessionManager.getSocket(sessionId);
  }

  async sendTextMessage(
    sessionId: string,
    jid: string,
    payload: TextPayload,
    quoted?: any,
  ): Promise<proto.WebMessageInfo | null> {
    quoted = {
      key: {
        remoteJid: jid,
        fromMe: true,
        id: quoted,
        participant: undefined,
      },
      message: {
        conversation: 'This is a quoted message',
      },
    };
    const opts = { quoted };
    try {
      const sock = this.getSocket(sessionId);
      if (!sock) {
        throw new Error(`Session ${sessionId} not found or not connected`);
      }

      const { text } = payload;

      if (!text || text.trim().length === 0) {
        throw new Error('Text message cannot be empty');
      }

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
    quoted?: any,
  ): Promise<proto.WebMessageInfo | null> {
    quoted = {
      key: {
        remoteJid: jid,
        fromMe: true,
        id: quoted,
        participant: undefined,
      },
      message: {
        conversation: 'This is a quoted message',
      },
    };
    try {
      const sock = this.getSocket(sessionId);
      if (!sock) throw new Error(`Session ${sessionId} not found`);

      const { url, caption } = payload;
      if (!url) throw new Error('Media URL is required');

      let msg: proto.WebMessageInfo | null;
      const opts = { quoted };

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

      return msg || null;
    } catch (error) {
      console.error(`Error sending reaction to ${jid}:`, error);
      throw error;
    }
  }
}
