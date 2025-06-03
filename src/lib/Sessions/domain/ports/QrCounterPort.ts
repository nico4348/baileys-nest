export interface QrCounterPort {
  getCurrentCount(sessionId: string): number;
  getMaxLimit(): number;
  getRemainingAttempts(sessionId: string): number;
  hasExceededLimit(sessionId: string): boolean;
  canGenerateQr(sessionId: string): boolean;
  incrementCounter(sessionId: string): number;
  resetCounter(sessionId: string): void;
  removeSession(sessionId: string): void;
}
