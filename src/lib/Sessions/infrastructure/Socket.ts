import makeWASocket, { fetchLatestBaileysVersion, Browsers } from 'baileys';
import * as qrcode from 'qrcode-terminal';
import * as QRCode from 'qrcode';
import pino from 'pino';
import { Boom } from '@hapi/boom';
import { DisconnectReason } from 'baileys';

import { AuthStateFactory } from '../../AuthState/infrastructure/AuthStateFactory';

export class WhatsAppSocketFactory {
  private qrGenerated: Map<string, boolean> = new Map();
  private qrCodes: Map<string, string> = new Map(); // Almacenar QR codes

  constructor(
    private authStateFactory: AuthStateFactory,
    private logger: any = pino({ level: 'silent' }),
    private retryCache: any = undefined,
    private sessionManager?: any, // Referencia al manager para reconexión
  ) {}

  // Método para obtener el QR de una sesión
  getQR(sessionId: string): string | null {
    return this.qrCodes.get(sessionId) || null;
  }
  // Método para verificar si hay QR disponible
  hasQR(sessionId: string): boolean {
    return this.qrCodes.has(sessionId);
  }

  // Método para obtener el QR como imagen base64
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

    // Manejo de eventos usando process() como en el ejemplo
    socket.ev.process(async (events) => {
      // Manejo de actualización de conexión
      if (events['connection.update']) {
        const update = events['connection.update'];
        const { connection, lastDisconnect, qr } = update;
        if (qr && !state.creds?.registered) {
          // Almacenar el QR code
          this.qrCodes.set(sessionId, qr);

          // Verificar si la sesión está pausada
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
          // Reconectar si no fue logout Y la sesión no está pausada intencionalmente
          if (statusCode !== DisconnectReason.loggedOut) {
            try {
              // Verificar si la sesión está pausada antes de reconectar
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
          // Marcar como registrado si es la primera vez
          if (!state.creds?.registered) {
            state.creds.registered = true;
          }

          this.qrGenerated.delete(sessionId); // Limpiar flag de QR
          this.qrCodes.delete(sessionId); // Limpiar QR code almacenado
        }
      } // Credenciales actualizadas - guardar
      if (events['creds.update']) {
        // Si había QR y ahora se actualizan credenciales, probablemente se escaneó
        const hadQR = this.qrGenerated.get(sessionId);
        if (hadQR && state.creds && !state.creds.registered) {
          state.creds.registered = true;
          this.qrGenerated.delete(sessionId);
          this.qrCodes.delete(sessionId); // Limpiar QR code almacenado
        }

        try {
          await saveCreds();
        } catch (error) {
          // Error guardando credenciales
        }
      }
    });

    return socket;
  }
}

export default WhatsAppSocketFactory;
