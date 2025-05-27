import makeWASocket, {
  fetchLatestBaileysVersion,
  Browsers,
  DisconnectReason,
} from 'baileys';
import { Boom } from '@hapi/boom';
import pino from 'pino';
import { AuthStateFactory } from '../../AuthState/infrastructure/AuthStateFactory';
import { ISocketFactory } from './interfaces/ISocketFactory';
import { IConnectionManager } from './interfaces/IConnectionManager';
import { IQrManager } from './interfaces/IQrManager';
import { ISessionStateManager } from './interfaces/ISessionStateManager';

export class WhatsAppSocketFactory implements ISocketFactory {
  constructor(
    private readonly authStateFactory: AuthStateFactory,
    private readonly qrManager: IQrManager,
    private readonly connectionManager: IConnectionManager,
    private readonly sessionStateManager: ISessionStateManager,
    private readonly logger: any = pino({ level: 'silent' }),
    private readonly retryCache: any = undefined,
  ) {}

  getQR(sessionId: string): string | null {
    return this.qrManager.getQr(sessionId);
  }

  hasQR(sessionId: string): boolean {
    return this.qrManager.hasQr(sessionId);
  }

  async getQRAsBase64(sessionId: string): Promise<string | null> {
    return this.qrManager.getQrAsBase64(sessionId);
  }

  async createSocket(sessionId: string): Promise<any> {
    const { state, saveCreds, deleteSession } =
      await this.authStateFactory.createAuthState(sessionId);
    const { version } = await fetchLatestBaileysVersion();

    const socket = makeWASocket({
      version,
      logger: this.logger,
      printQRInTerminal: false,
      msgRetryCounterCache: this.retryCache,
      auth: state,
      browser: Browsers.ubuntu(`MultiBot_${sessionId}`),
      generateHighQualityLinkPreview: true,
      syncFullHistory: false,
      markOnlineOnConnect: false,
      emitOwnEvents: false,
    });

    socket.ev.process(async (events) => {
      if (events['connection.update']) {
        const update = { ...events['connection.update'], state };
        await this.connectionManager.handleConnectionUpdate(sessionId, update);
        if (
          update.connection === 'close' &&
          (update.lastDisconnect?.error as Boom)?.output?.statusCode ===
            DisconnectReason.loggedOut
        ) {
          await deleteSession();
        }
      }

      if (events['creds.update']) {
        await this.connectionManager.handleCredentialsUpdate(sessionId);

        try {
          await saveCreds();
        } catch (error) {
          console.error(
            `Error saving credentials for session ${sessionId}:`,
            error,
          );
        }
      }
    });

    return socket;
  }
}

export default WhatsAppSocketFactory;
