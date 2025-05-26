import makeWASocket, { fetchLatestBaileysVersion, Browsers } from 'baileys';
import * as qrcode from 'qrcode-terminal';
import pino from 'pino';
import { Boom } from '@hapi/boom';
import { DisconnectReason } from 'baileys';

import { AuthStateFactory } from '../../AuthState/infrastructure/AuthStateFactory';

export class WhatsAppSocketFactory {
  private qrGenerated: Map<string, boolean> = new Map();

  constructor(
    private authStateFactory: AuthStateFactory,
    private logger: any = pino({ level: 'silent' }),
    private retryCache: any = undefined,
    private sessionManager?: any, // Referencia al manager para reconexión
  ) {}

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
          qrcode.generate(qr, { small: true });
          this.qrGenerated.set(sessionId, true);
        }

        if (connection === 'close') {
          const statusCode = (lastDisconnect?.error as Boom)?.output
            ?.statusCode;
          // Reconectar si no fue logout
          if (statusCode !== DisconnectReason.loggedOut) {
            try {
              if (this.sessionManager && this.sessionManager.recreateSession) {
                await this.sessionManager.recreateSession(sessionId);
              }
            } catch (error) {
              // Error en reconexión
            }
          } else {
            await deleteSession();
          }
        } else if (connection === 'open') {
          // Marcar como registrado si es la primera vez
          if (!state.creds?.registered) {
            state.creds.registered = true;
          }

          this.qrGenerated.delete(sessionId); // Limpiar flag de QR
        }
      } // Credenciales actualizadas - guardar
      if (events['creds.update']) {
        // Si había QR y ahora se actualizan credenciales, probablemente se escaneó
        const hadQR = this.qrGenerated.get(sessionId);
        if (hadQR && state.creds && !state.creds.registered) {
          state.creds.registered = true;
          this.qrGenerated.delete(sessionId);
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
