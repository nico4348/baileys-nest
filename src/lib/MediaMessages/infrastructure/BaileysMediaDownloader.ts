// src/lib/MediaMessages/infrastructure/BaileysMediaDownloader.ts
import { Injectable } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import { downloadContentFromMessage } from 'baileys';
import { WhatsAppSessionManager } from '../../Sessions/infrastructure/WhatsAppSessionManager';
import { MediaStorageService } from '../domain/ports/MediaStorageService';

const MEDIA_DIR = path.join(process.cwd(), 'media');

(async () => {
  try {
    await fs.mkdir(MEDIA_DIR, { recursive: true });
  } catch (error) {
    console.error('Error al crear la carpeta media:', error);
  }
})();

const MEDIA_INFO: Record<
  string,
  { ext: string; type: 'image' | 'video' | 'audio' | 'sticker' | 'document' }
> = {
  imageMessage: { ext: '.jpg', type: 'image' },
  videoMessage: { ext: '.mp4', type: 'video' },
  audioMessage: { ext: '.mp3', type: 'audio' },
  stickerMessage: { ext: '.webp', type: 'sticker' },
  documentMessage: { ext: '', type: 'document' },
};

@Injectable()
export class BaileysMediaDownloader {
  constructor(
    private readonly sessionManager: WhatsAppSessionManager,
    private readonly storageService?: MediaStorageService,
  ) {}

  private getMediaInfo(msg: any) {
    const mediaType = Object.keys(msg.message || {})[0];
    const info = MEDIA_INFO[mediaType!];
    if (!info) return null;

    let ext = info.ext;
    let filename = `${msg.key.id}${ext}`;

    if (mediaType === 'documentMessage') {
      const doc = msg.message.documentMessage;
      ext = '.' + (doc?.mimetype?.split('/')[1] || 'bin');
      filename = doc?.fileName || `${msg.key.id}${ext}`;
    }

    return { mediaType, ext, type: info.type, filename };
  }

  private async saveBufferToFile(
    buffer: Buffer,
    filename: string,
  ): Promise<string> {
    const filePath = path.join(MEDIA_DIR, filename);
    await fs.writeFile(filePath, buffer);
    console.log('✅ Guardado:', filePath);
    return filePath;
  }

  async downloadMedia(sessionId: string, msg: any): Promise<string | null> {
    if (!msg.message || msg.key.fromMe) return null;

    const info = this.getMediaInfo(msg);
    if (!info) return null;

    const sock = this.sessionManager.getSocket(sessionId);
    if (!sock) {
      console.error(`Session ${sessionId} not found`);
      return null;
    }

    try {
      const stream = await downloadContentFromMessage(
        (msg.message as any)[info.mediaType!],
        info.type,
      );
      const chunks: Buffer[] = [];
      for await (const chunk of stream) {
        chunks.push(chunk);
      }

      const buffer = Buffer.concat(chunks);

      if (this.storageService) {
        const uploadResult = await this.storageService.uploadBuffer(
          buffer,
          info.filename,
          sessionId,
          msg.key.id,
          info.type,
        );

        if (uploadResult.success) {
          console.log(`✅ Media uploaded to storage: ${uploadResult.url}`);
          return uploadResult.url;
        } else {
          console.error(`❌ Storage upload failed: ${uploadResult.error}`);
        }
      }

      return await this.saveBufferToFile(buffer, info.filename);
    } catch (error) {
      console.error(`Error downloading media for msgId ${msg.key.id}:`, error);
      return null;
    }
  }
}
