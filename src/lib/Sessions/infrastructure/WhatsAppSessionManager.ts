import { Injectable } from '@nestjs/common';
import makeWASocket from 'baileys';
import { AuthStateFactory } from '../../AuthState/infraestructure/AuthStateFactory';

@Injectable()
export class WhatsAppSessionManager {
  private sessions = new Map();

  constructor(private readonly authStateFactory: AuthStateFactory) {}

  async createSession(
    sessionId: string,
  ): Promise<ReturnType<typeof makeWASocket>> {
    // Obtén el estado de autenticación desde nuestro servicio
    const { state, saveCreds } =
      await this.authStateFactory.createAuthState(sessionId);

    // Crea un socket de WhatsApp usando el estado de autenticación
    const socket = makeWASocket({
      auth: state,
      // Otras configuraciones...
    });

    // Escucha eventos de credenciales actualizadas
    socket.ev.on('creds.update', saveCreds);

    // Almacena el socket en la memoria
    this.sessions.set(sessionId, socket);

    return socket;
  }

  // Otros métodos para gestionar las sesiones...
}
