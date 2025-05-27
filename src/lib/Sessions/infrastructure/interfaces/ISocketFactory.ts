export interface ISocketFactory {
  getQR(sessionId: string): string | null;
  hasQR(sessionId: string): boolean;
  getQRAsBase64(sessionId: string): Promise<string | null>;
  createSocket(sessionId: string): Promise<any>;
}