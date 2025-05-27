import { Injectable } from '@nestjs/common';

@Injectable()
export class SessionQrService {
  private socketFactories: Map<string, any> = new Map();

  setSocketFactory(sessionId: string, factory: any): void {
    this.socketFactories.set(sessionId, factory);
  }

  removeSocketFactory(sessionId: string): void {
    this.socketFactories.delete(sessionId);
  }

  getQr(sessionId: string): string | null {
    const socketFactory = this.socketFactories.get(sessionId);
    if (socketFactory && socketFactory.getQR) {
      return socketFactory.getQR(sessionId);
    }
    return null;
  }

  hasQr(sessionId: string): boolean {
    const socketFactory = this.socketFactories.get(sessionId);
    if (socketFactory && socketFactory.hasQR) {
      return socketFactory.hasQR(sessionId);
    }
    return false;
  }

  async getQrAsBase64(sessionId: string): Promise<string | null> {
    const socketFactory = this.socketFactories.get(sessionId);
    if (socketFactory && socketFactory.getQRAsBase64) {
      return await socketFactory.getQRAsBase64(sessionId);
    }
    return null;
  }
}
