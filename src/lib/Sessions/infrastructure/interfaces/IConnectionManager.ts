export interface IConnectionManager {
  handleConnectionUpdate(sessionId: string, update: any): Promise<void>;
  handleCredentialsUpdate(sessionId: string): Promise<void>;
}