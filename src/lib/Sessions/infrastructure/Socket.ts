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
import { IncomingMessageQueue } from '../../Messages/infrastructure/IncomingMessageQueue';

export class WhatsAppSocketFactory implements ISocketFactory {
  constructor(
    private readonly authStateFactory: AuthStateFactory,
    private readonly qrManager: IQrManager,
    private readonly connectionManager: IConnectionManager,
    private readonly sessionStateManager: ISessionStateManager,
    private readonly eventLogger: IBaileysEventLogger,
    private readonly messageStatusTracker?: MessageStatusTracker,
    private readonly messagesHandleIncoming?: MessagesHandleIncoming,
    private readonly incomingMessageQueue?: IncomingMessageQueue,
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
      // Log all events to EventLogs (silent)
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
        // Queue incoming messages for async processing
        if (this.incomingMessageQueue && events['messages.upsert'].messages) {
          const incomingMessages = events['messages.upsert'].messages.filter(
            (msg) => !msg.key?.fromMe,
          );

          if (incomingMessages.length > 0) {
          }

          for (const message of incomingMessages) {
            const messageType = this.determineMessageType(message);
            const processingFlags = this.getProcessingFlags(
              message,
              messageType,
            );

            await this.incomingMessageQueue.addIncomingMessage({
              sessionId,
              messageData: {
                baileysId: message.key?.id || `msg_${Date.now()}`,
                from:
                  message.key?.remoteJid?.replace('@s.whatsapp.net', '') ||
                  'unknown',
                to: sessionId,
                messageType,
                baileysJson: message,
                quotedMessageId:
                  this.extractQuotedMessageId(message) || undefined,
                timestamp: new Date(
                  (Number(message.messageTimestamp) ||
                    Math.floor(Date.now() / 1000)) * 1000,
                ),
              },
              messageContent: this.extractMessageContent(message, messageType),
              priority: processingFlags.requiresNotification
                ? 'high'
                : 'normal',
              processingFlags,
            });
          }
        } else if (
          this.messagesHandleIncoming &&
          events['messages.upsert'].messages
        ) {
          // Fallback to direct processing if queue is not available
          console.log(
            `⚠️ [${sessionId}] Queue unavailable, using direct processing`,
          );
          await this.messagesHandleIncoming.handleIncomingMessages(
            sessionId,
            events['messages.upsert'].messages,
            socket,
          );
        }
      }

      if (events['messages.update']) {
        // Track message status updates
        if (this.messageStatusTracker) {
          await this.messageStatusTracker.handleMessagesUpdate(
            sessionId,
            events['messages.update'],
          );
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

  private determineMessageType(message: any): string {
    if (message.message?.reactionMessage) {
      return 'react';
    }

    if (message.message?.conversation || message.message?.extendedTextMessage) {
      return 'txt';
    }

    if (
      message.message?.imageMessage ||
      message.message?.videoMessage ||
      message.message?.audioMessage ||
      message.message?.documentMessage ||
      message.message?.stickerMessage
    ) {
      return 'media';
    }

    return 'txt'; // Default to text
  }

  private getProcessingFlags(message: any, messageType: string) {
    const isGroupMessage = message.key?.remoteJid?.endsWith('@g.us') || false;
    const needsMediaDownload = messageType === 'media';

    return {
      needsMediaDownload,
      needsS3Upload: needsMediaDownload,
      isGroupMessage,
      requiresNotification: !isGroupMessage, // Only notify for direct messages
    };
  }

  private extractQuotedMessageId(message: any): string | null {
    // For text messages with quotes
    if (message.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
      return message.message.extendedTextMessage.contextInfo.stanzaId || null;
    }

    // For other message types with quotes
    if (message.message?.contextInfo?.quotedMessage) {
      return message.message.contextInfo.stanzaId || null;
    }

    return null;
  }

  private extractMessageContent(message: any, messageType: string) {
    switch (messageType) {
      case 'txt':
        return {
          text:
            message.message?.conversation ||
            message.message?.extendedTextMessage?.text ||
            '',
        };

      case 'media':
        const mediaMsg =
          message.message?.imageMessage ||
          message.message?.videoMessage ||
          message.message?.audioMessage ||
          message.message?.documentMessage ||
          message.message?.stickerMessage;

        return {
          mediaType: this.getMediaType(message.message),
          caption: mediaMsg?.caption || null,
          fileName: mediaMsg?.fileName || `media_${Date.now()}`,
          mimeType: mediaMsg?.mimetype || 'application/octet-stream',
        };

      case 'react':
        const reactionMsg = message.message?.reactionMessage;
        return {
          emoji: reactionMsg?.text || '',
          targetMessageId: reactionMsg?.key?.id || '',
        };

      default:
        return {};
    }
  }

  private getMediaType(messageContent: any): string {
    if (messageContent.imageMessage) return 'image';
    if (messageContent.videoMessage) return 'video';
    if (messageContent.audioMessage) return 'audio';
    if (messageContent.documentMessage) return 'document';
    if (messageContent.stickerMessage) return 'sticker';
    return 'unknown';
  }
}

export default WhatsAppSocketFactory;
