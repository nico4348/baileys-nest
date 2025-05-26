import { generateRegistrationId, Curve, signedKeyPair } from 'baileys';
import { randomBytes } from 'crypto';
import { v4 as uuidv4 } from 'uuid';

export class AuthCredsInit {
  initAuthCreds() {
    const identityKey = Curve.generateKeyPair();
    return {
      noiseKey: Curve.generateKeyPair(),
      signedIdentityKey: identityKey,
      signedPreKey: signedKeyPair(identityKey, 1),
      registrationId: generateRegistrationId(),
      advSecretKey: randomBytes(32).toString('base64'),
      processedHistoryMessages: [],
      nextPreKeyId: 1,
      firstUnuploadedPreKeyId: 1,
      accountSyncCounter: 0,
      accountSettings: {
        unarchiveChats: false,
      },
      deviceId: randomBytes(16).toString('base64'),
      phoneId: uuidv4(),
      identityId: randomBytes(20),
      registered: false,
      backupToken: randomBytes(20),
      registration: {},
      pairingEphemeralKeyPair: Curve.generateKeyPair(),
      pairingCode: undefined,
      lastPropHash: undefined,
      routingInfo: undefined,
    };
  }
}
