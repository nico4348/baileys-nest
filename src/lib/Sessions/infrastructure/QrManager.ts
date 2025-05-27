import { Injectable } from '@nestjs/common';
import * as QRCode from 'qrcode';
import { IQrManager } from './interfaces/IQrManager';
import { ISessionLogger } from './interfaces/ISessionLogger';

@Injectable()
export class QrManager implements IQrManager {
  private qrCodes: Map<string, string> = new Map();

  constructor(private readonly logger: ISessionLogger) {}

  storeQr(sessionId: string, qr: string): void {
    this.qrCodes.set(sessionId, qr);
    this.logger.info('QR code generated', sessionId);
  }

  getQr(sessionId: string): string | null {
    return this.qrCodes.get(sessionId) || null;
  }

  hasQr(sessionId: string): boolean {
    return this.qrCodes.has(sessionId);
  }

  removeQr(sessionId: string): void {
    this.qrCodes.delete(sessionId);
    this.logger.info('QR code removed', sessionId);
  }

  async getQrAsBase64(sessionId: string): Promise<string | null> {
    const qrString = this.qrCodes.get(sessionId);
    if (!qrString) return null;

    try {
      const qrCodeDataURL = await QRCode.toDataURL(qrString);
      return qrCodeDataURL;
    } catch (error) {
      this.logger.error('Error generating QR base64', error, sessionId);
      return null;
    }
  }
}