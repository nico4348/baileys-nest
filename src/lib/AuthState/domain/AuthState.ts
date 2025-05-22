// Definición de entidad de dominio sin dependencias externas
export interface AuthCreds {
  noiseKey: any;
  signedIdentityKey: any;
  signedPreKey: any;
  registrationId: number;
  advSecretKey: string;
  processedHistoryMessages: any[];
  nextPreKeyId: number;
  firstUnuploadedPreKeyId: number;
  accountSyncCounter: number;
  accountSettings: {
    unarchiveChats: boolean;
  };
  deviceId: string;
  phoneId: string;
  identityId: Buffer;
  registered: boolean;
  backupToken: Buffer;
  registration: Record<string, any>;
  pairingEphemeralKeyPair: any;
  pairingCode?: string;
  lastPropHash?: string;
  routingInfo?: any;
}

export interface AuthState {
  creds: AuthCreds;
  keys: {
    get: (type: string, ids: string[]) => Promise<Record<string, any>>;
    set: (data: Record<string, Record<string, any>>) => Promise<void>;
  };
}
