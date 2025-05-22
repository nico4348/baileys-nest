// Puerto primario (casos de uso)
export interface AuthStateService {
  getAuthState(sessionId: string): Promise<any>;
  saveCreds(sessionId: string, creds: any): Promise<void>;
  deleteSession(sessionId: string): Promise<void>;
  writeData(sessionId: string, key: string, data: any): Promise<void>;
  readData(sessionId: string, key: string): Promise<any | null>;
  removeData(sessionId: string, key: string): Promise<void>;
}
