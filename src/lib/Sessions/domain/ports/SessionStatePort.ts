export interface SessionStatePort {
  startSession(sessionId: string): Promise<any>;
  resumeSession(sessionId: string): Promise<any>;
  recreateSession(sessionId: string): Promise<any>;
  pauseSession(sessionId: string): Promise<void>;
  deleteSession(sessionId: string): Promise<void>;
  isSessionPaused(sessionId: string): Promise<boolean>;
  isSessionRestarting(sessionId: string): boolean;
  isSessionDeleting(sessionId: string): boolean;
  getSocket(sessionId: string): any | null;
  getSessionQR(sessionId: string): string | null;
  hasSessionQR(sessionId: string): boolean;
  getSessionQRAsBase64(sessionId: string): Promise<string | null>;
}
