export interface ISessionStateManager {
  isSessionPaused(sessionId: string): Promise<boolean>;
  isSessionRestarting(sessionId: string): boolean;
  isSessionDeleting(sessionId: string): boolean;
  recreateSession(sessionId: string): Promise<any>;
  resumeSession(sessionId: string): Promise<any>;
}
