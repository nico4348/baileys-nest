import makeWASocket, { fetchLatestBaileysVersion, Browsers } from 'baileys';
import * as qrcode from 'qrcode-terminal';
import pino from 'pino';
import { Boom } from '@hapi/boom';
import { DisconnectReason } from 'baileys';

import { AuthStateFactory } from '../../AuthState/infraestructure/AuthStateFactory';

export class WhatsAppSocketFactory {
  constructor(
    private authStateFactory: AuthStateFactory,
    private logger: any = pino({ level: 'silent' }),
    private retryCache: any = undefined,
  ) {}

  async createSocket(sessionId: string): Promise<any> {
    // Obtén el estado de autenticación desde nuestro servicio
    const { state, saveCreds, deleteSession } =
      await this.authStateFactory.createAuthState(sessionId);

    // Crea un socket de WhatsApp usando el estado de autenticación
    const { version } = await fetchLatestBaileysVersion();

    const socket = makeWASocket({
      version,
      logger: this.logger,
      printQRInTerminal: false,
      msgRetryCounterCache: this.retryCache,
      auth: state,
      browser: Browsers.ubuntu(`MultiBot_${sessionId}`),
      generateHighQualityLinkPreview: true,
    });

    // Manejo de eventos de conexión y QR
    socket.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;
      if (qr) {
        qrcode.generate(qr, { small: true });
      }

      if (connection === 'close') {
        const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;
        const shouldReconnect =
          !(lastDisconnect?.error instanceof Boom) ||
          statusCode !== DisconnectReason.loggedOut;

        console.log(
          'connection closed due to',
          lastDisconnect?.error,
          ', reconnecting',
          shouldReconnect,
        );

        this.logger.info('Session auth data deleted');

        if (shouldReconnect) {
          this.logger.info('Reconnecting...');
        }
      } else if (connection === 'open') {
        console.log('Conectado exitosamente a WhatsApp');
      }
    });

    // Escucha eventos de credenciales actualizadas
    socket.ev.on('creds.update', saveCreds);

    return socket;
  }
}

export default WhatsAppSocketFactory;
