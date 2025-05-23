import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import makeWASocket from 'baileys';
import { AuthStateFactory } from '../../AuthState/infraestructure/AuthStateFactory';
import * as qrcode from 'qrcode-terminal';
import { Boom } from '@hapi/boom';
import { DisconnectReason } from 'baileys';
import { SessionsRepository } from '../domain/SessionsRepository';
import { SessionStatus } from '../domain/SessionStatus';

@Injectable()
export class WhatsAppSessionManager implements OnModuleInit {
  private sessions = new Map();

  constructor(
    private readonly authStateFactory: AuthStateFactory,
    @Inject('SessionsRepository')
    private readonly sessionsRepository: SessionsRepository,
  ) {}

  async onModuleInit() {
    // Inicia una sesión automáticamente al arrancar el servidor
    const allSessions = await this.sessionsRepository.getAll();
    const activeSessions = allSessions.filter(
      (s) => s.status.value && !s.isDeleted.value,
    );
    for (const session of activeSessions) {
      await this.createSession(session.id.value);
    }
  }

  async createSession(
    sessionId: string,
  ): Promise<ReturnType<typeof makeWASocket>> {
    // Obtén el estado de autenticación desde nuestro servicio
    const { state, saveCreds } =
      await this.authStateFactory.createAuthState(sessionId);

    // Crea un socket de WhatsApp usando el estado de autenticación
    const socket = makeWASocket({
      auth: state,
      printQRInTerminal: false, // Ya no se recomienda poner esto en true
    });

    // Manejo de eventos de conexión y QR
    socket.ev.on('connection.update', (update) => {
      const { connection, lastDisconnect, qr } = update;
      if (qr) {
        qrcode.generate(qr, { small: true }); // Genera e imprime el QR manualmente
      }
      if (connection === 'close') {
        const shouldReconnect =
          (lastDisconnect?.error as Boom)?.output?.statusCode !==
          DisconnectReason.loggedOut;
        console.log(
          'connection closed due to',
          lastDisconnect?.error,
          ', reconnecting',
          shouldReconnect,
        );
        if (shouldReconnect) {
          this.createSession(sessionId); // Reconecta la sesión
        }
      } else if (connection === 'open') {
        console.log('Conectado exitosamente a WhatsApp');
      }
    });

    // Escucha eventos de credenciales actualizadas
    socket.ev.on('creds.update', saveCreds);

    // Almacena el socket en la memoria
    this.sessions.set(sessionId, socket);

    return socket;
  }

  // Otros métodos para gestionar las sesiones...
}
