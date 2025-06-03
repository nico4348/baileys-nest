export interface QrCounterPort {
  getCurrentCount(sessionId: string): number;
  getMaxLimit(): number;
  getRemainingAttempts(sessionId: string): number;
  hasExceededLimit(sessionId: string): boolean;
  canGenerateQr(sessionId: string): boolean;
}
