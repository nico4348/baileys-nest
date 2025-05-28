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
import { IBaileysEventLogger } from '../../EventLogs/infrastructure/BaileysEventLogger';

export class WhatsAppSocketFactory implements ISocketFactory {
  constructor(
    private readonly authStateFactory: AuthStateFactory,
    private readonly qrManager: IQrManager,
    private readonly connectionManager: IConnectionManager,
    private readonly sessionStateManager: ISessionStateManager,
    private readonly eventLogger: IBaileysEventLogger,
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
      // Log all events to EventLogs
      for (const eventName of Object.keys(events)) {
        await this.eventLogger.logEvent(sessionId, eventName);
      }

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

      // Handle other Baileys events
      if (events['messages.upsert']) {
        // Additional message handling logic can be added here
      }

      if (events['messages.update']) {
        // Additional message update handling logic can be added here
      }

      if (events['presence.update']) {
        // Additional presence handling logic can be added here
      }

      if (events['chats.upsert']) {
        // Additional chat handling logic can be added here
      }

      if (events['groups.upsert']) {
        // Additional group handling logic can be added here
      }

      if (events['call']) {
        // Additional call handling logic can be added here
      }
    });

    return socket;
  }
}

export default WhatsAppSocketFactory;
