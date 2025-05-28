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
  quoted?: any;
}

export interface ReactPayload {
  key: any;
  emoji: string;
}

@Injectable()
export class BaileysMessageSender {
  constructor(
    private readonly sessionManager: WhatsAppSessionManager,
  ) {}

  private getSocket(sessionId: string): WASocket | null {
    return this.sessionManager.getSocket(sessionId);
  }

  async sendTextMessage(
    sessionId: string,
    jid: string,
    payload: TextPayload,
  ): Promise<proto.WebMessageInfo | null> {
    try {
      const sock = this.getSocket(sessionId);
      if (!sock) {
        throw new Error(`Session ${sessionId} not found or not connected`);
      }

      const { text, quoted } = payload;
      
      if (!text || text.trim().length === 0) {
        throw new Error('Text message cannot be empty');
      }

      const msg = await sock.sendMessage(jid, { text }, { quoted });
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
  ): Promise<proto.WebMessageInfo | null> {
    try {
      const sock = this.getSocket(sessionId);
      if (!sock) {
        throw new Error(`Session ${sessionId} not found or not connected`);
      }

      const { url, caption, quoted } = payload;

      if (!url) {
        throw new Error('Media URL is required');
      }

      let msg: proto.WebMessageInfo | null = null;
      
      switch (mediaType) {
        case 'voiceNote':
          msg = (await sock.sendMessage(
            jid,
            { audio: { url }, ptt: true },
            { quoted },
          )) || null;
          break;
        case 'audio':
          msg = (await sock.sendMessage(jid, { audio: { url } }, { quoted })) || null;
          break;
        case 'video':
          msg = (await sock.sendMessage(
            jid,
            { video: { url }, caption },
            { quoted },
          )) || null;
          break;
        case 'image':
          msg = (await sock.sendMessage(
            jid,
            { image: { url }, caption },
            { quoted },
          )) || null;
          break;
        case 'sticker':
          msg = (await sock.sendMessage(jid, { sticker: { url } }, { quoted })) || null;
          break;
        case 'document':
          const fileName = path.basename(url);
          const mimetype = lookup(url) || 'application/octet-stream';
          msg = (await sock.sendMessage(
            jid,
            {
              document: { url },
              caption,
              fileName,
              mimetype,
            },
            { quoted },
          )) || null;
          break;
        default:
          throw new Error(`Unsupported media type: ${mediaType}`);
      }

      return msg;
    } catch (error) {
      console.error(`Error sending ${mediaType} message to ${jid}:`, error);
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
