import makeWASocket, { fetchLatestBaileysVersion, Browsers } from 'baileys';
import * as qrcode from 'qrcode-terminal';
import * as QRCode from 'qrcode';
import pino from 'pino';
import { Boom } from '@hapi/boom';
import { DisconnectReason } from 'baileys';

import { AuthStateFactory } from '../../AuthState/infrastructure/AuthStateFactory';

export class WhatsAppSocketFactory {
  private qrGenerated: Map<string, boolean> = new Map();
  private qrCodes: Map<string, string> = new Map();

  constructor(
    private authStateFactory: AuthStateFactory,
    private logger: any = pino({ level: 'silent' }),
    private retryCache: any = undefined,
    private sessionManager?: any,
  ) {}

  getQR(sessionId: string): string | null {
    return this.qrCodes.get(sessionId) || null;
  }

  hasQR(sessionId: string): boolean {
    return this.qrCodes.has(sessionId);
  }

  async getQRAsBase64(sessionId: string): Promise<string | null> {
    const qrString = this.qrCodes.get(sessionId);
    if (!qrString) return null;

    try {
      const qrCodeDataURL = await QRCode.toDataURL(qrString);
      return qrCodeDataURL;
    } catch (error) {
      console.error(
        `Error generando QR base64 para sesión ${sessionId}:`,
        error,
      );
      return null;
    }
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
        const update = events['connection.update'];
        const { connection, lastDisconnect, qr } = update;
        if (qr && !state.creds?.registered) {
          this.qrCodes.set(sessionId, qr);

          const isPaused = this.sessionManager
            ? await this.sessionManager.isSessionPaused(sessionId)
            : false;
          if (isPaused) {
            console.log(
              `⚠️ ADVERTENCIA: QR generado para sesión PAUSADA: ${sessionId}`,
            );
          } else {
            console.log(`📱 QR generado para la sesión: ${sessionId}`);
          }
          qrcode.generate(qr, { small: true });
          this.qrGenerated.set(sessionId, true);
        }
        if (connection === 'close') {
          const statusCode = (lastDisconnect?.error as Boom)?.output
            ?.statusCode;

          if (statusCode !== DisconnectReason.loggedOut) {
            try {
              const isPaused = this.sessionManager
                ? await this.sessionManager.isSessionPaused(sessionId)
                : false;
              if (
                this.sessionManager &&
                this.sessionManager.recreateSession &&
                !isPaused
              ) {
                console.log(
                  `🔄 Reconectando sesión automáticamente: ${sessionId}`,
                );
                await this.sessionManager.recreateSession(sessionId);
              } else if (isPaused) {
                console.log(
                  `⏸️ Sesión ${sessionId} está pausada, no se reconecta automáticamente`,
                );
              }
            } catch (error) {
              console.error(`Error en reconexión de ${sessionId}:`, error);
            }
          } else {
            console.log(`🚪 Sesión ${sessionId} cerrada por logout`);
            await deleteSession();
          }
        } else if (connection === 'open') {
          if (!state.creds?.registered) {
            state.creds.registered = true;
          }

          this.qrGenerated.delete(sessionId);
          this.qrCodes.delete(sessionId);
        }
      }
      if (events['creds.update']) {
        const hadQR = this.qrGenerated.get(sessionId);
        if (hadQR && state.creds && !state.creds.registered) {
          state.creds.registered = true;
          this.qrGenerated.delete(sessionId);
          this.qrCodes.delete(sessionId);
        }

        try {
          await saveCreds();
        } catch (error) {
          console.error(
            `Error guardando credenciales para sesión ${sessionId}:`,
            error,
          );
        }
      }
    });

    return socket;
  }
}

export default WhatsAppSocketFactory;
