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
import { MessageStatusTracker } from '../../MessageStatus/infrastructure/MessageStatusTracker';
import { MessagesHandleIncoming } from '../../Messages/application/MessagesHandleIncoming';

export class WhatsAppSocketFactory implements ISocketFactory {
  constructor(
    private readonly authStateFactory: AuthStateFactory,
    private readonly qrManager: IQrManager,
    private readonly connectionManager: IConnectionManager,
    private readonly sessionStateManager: ISessionStateManager,
    private readonly eventLogger: IBaileysEventLogger,
    private readonly messageStatusTracker?: MessageStatusTracker,
    private readonly messagesHandleIncoming?: MessagesHandleIncoming,
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
      console.log(`🚀 [Socket] Processing events for session ${sessionId}:`, Object.keys(events));
      
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
        console.log(`📨 [Socket] messages.upsert event received for session ${sessionId}`);
        console.log(`📨 [Socket] Messages count: ${events['messages.upsert'].messages?.length || 0}`);
        console.log(`📨 [Socket] Messages data:`, JSON.stringify(events['messages.upsert'].messages, null, 2));
        
        // Handle incoming messages
        if (this.messagesHandleIncoming && events['messages.upsert'].messages) {
          console.log(`📨 [Socket] Calling messagesHandleIncoming.handleIncomingMessages`);
          await this.messagesHandleIncoming.handleIncomingMessages(
            sessionId,
            events['messages.upsert'].messages,
            socket // Pass the socket for media download
          );
        } else {
          console.log(`⚠️ [Socket] messagesHandleIncoming not available or no messages to process`);
        }
      }

      if (events['messages.update']) {
        // Track message status updates
        if (this.messageStatusTracker) {
          await this.messageStatusTracker.handleMessagesUpdate(sessionId, events['messages.update']);
        }
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
