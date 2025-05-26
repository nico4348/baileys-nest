import makeWASocket, { fetchLatestBaileysVersion, Browsers } from 'baileys';
import * as qrcode from 'qrcode-terminal';
import pino from 'pino';
import { Boom } from '@hapi/boom';
import { DisconnectReason } from 'baileys';

import { AuthStateFactory } from '../../AuthState/infrastructure/AuthStateFactory';

export class WhatsAppSocketFactory {
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
    }); // Manejo de eventos de conexión y QR
    socket.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;

      console.log(`[${sessionId}] Connection update:`, {
        connection,
        hasQR: !!qr,
      });

      if (qr) {
        console.log(
          `[${sessionId}] 🔄 Nuevo QR generado - Esperando escaneo...`,
        );
        qrcode.generate(qr, { small: true });
        console.log(`[${sessionId}] ✅ QR mostrado en terminal`);
      }

      if (connection === 'close') {
        const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;
        const shouldReconnect =
          !(lastDisconnect?.error instanceof Boom) ||
          statusCode !== DisconnectReason.loggedOut;

        console.log(
          `[${sessionId}] ❌ Conexión cerrada:`,
          lastDisconnect?.error,
          '| Reconectar:',
          shouldReconnect,
        );

        if (statusCode === DisconnectReason.loggedOut) {
          console.log(
            `[${sessionId}] 🗑️ Sesión deslogueada - Eliminando datos de auth`,
          );
          await deleteSession();
        }
        if (shouldReconnect) {
          console.log(`[${sessionId}] 🔄 Intentando reconectar...`);
          // Implementar reconexión después de un pequeño delay
          setTimeout(async () => {
            try {
              console.log(`[${sessionId}] 🔄 Iniciando reconexión...`);
              if (this.sessionManager && this.sessionManager.recreateSession) {
                await this.sessionManager.recreateSession(sessionId);
              } else {
                console.log(
                  `[${sessionId}] ⚠️ SessionManager no disponible para reconexión`,
                );
              }
            } catch (error) {
              console.error(
                `[${sessionId}] ❌ Error durante reconexión:`,
                error,
              );
            }
          }, 3000); // Delay de 3 segundos antes de reconectar
        }
      } else if (connection === 'open') {
        console.log(`[${sessionId}] ✅ ¡Conectado exitosamente a WhatsApp!`);
        console.log(
          `[${sessionId}] 💾 Guardando credenciales después de conexión exitosa...`,
        );
        try {
          await saveCreds();
          console.log(
            `[${sessionId}] ✅ Credenciales guardadas exitosamente después de conexión`,
          );
        } catch (error) {
          console.error(
            `[${sessionId}] ❌ Error guardando credenciales después de conexión:`,
            error,
          );
        }
      }
    }); // Escucha eventos de credenciales actualizadas
    socket.ev.on('creds.update', async () => {
      console.log(`[${sessionId}] 🔄 Credenciales actualizadas - Guardando...`);
      try {
        await saveCreds();
        console.log(`[${sessionId}] ✅ Credenciales guardadas exitosamente`);
      } catch (error) {
        console.error(`[${sessionId}] ❌ Error guardando credenciales:`, error);
      }
    });

    return socket;
  }
}

export default WhatsAppSocketFactory;
