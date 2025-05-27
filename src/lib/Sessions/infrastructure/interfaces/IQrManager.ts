export interface IQrManager {
  storeQr(sessionId: string, qr: string): void;
  getQr(sessionId: string): string | null;
  hasQr(sessionId: string): boolean;
  removeQr(sessionId: string): void;
  getQrAsBase64(sessionId: string): Promise<string | null>;
}