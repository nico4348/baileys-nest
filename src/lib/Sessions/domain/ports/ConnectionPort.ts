export interface ConnectionPort {
  handleConnectionUpdate(sessionId: string, update: any): Promise<void>;
  handleCredentialsUpdate(sessionId: string): Promise<void>;
  setSessionStateManager(sessionStateManager: any): void;
}
