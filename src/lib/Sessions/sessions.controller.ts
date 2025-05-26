// src/lib/Sessions/sessions.controller.ts
import {
  Controller,
  Get,
  Post,
  Param,
  Delete,
  Body,
  NotFoundException,
  InternalServerErrorException,
  Inject,
} from '@nestjs/common';
import { SessionsCreate } from './application/SessionsCreate';
import { WhatsAppSessionManager } from './infrastructure/WhatsAppSessionManager';
import { randomUUID } from 'crypto';

@Controller('sessions')
export class SessionsController {
  constructor(
    @Inject('SessionsCreate') private readonly sessionsCreate: SessionsCreate,
    private readonly whatsAppSessionManager: WhatsAppSessionManager,
  ) {}

  @Post()
  async create(@Body() body) {
    const generatedId = randomUUID();

    // Crear la sesión en la base de datos
    await this.sessionsCreate.run(
      generatedId,
      body.session_name,
      body.phone,
      true,
      new Date(),
      new Date(),
      false,
    );

    // Iniciar la sesión de WhatsApp
    try {
      await this.whatsAppSessionManager.startSession(generatedId);
      return {
        success: true,
        sessionId: generatedId,
        message:
          'Sesión creada e iniciada exitosamente. Escanea el QR si aparece.',
      };
    } catch (error) {
      return {
        success: false,
        sessionId: generatedId,
        message:
          'Sesión creada pero error al iniciar WhatsApp: ' + error.message,
      };
    }
  }

  @Post(':sessionId/start')
  async startWhatsAppSession(@Param('sessionId') sessionId: string) {
    try {
      await this.whatsAppSessionManager.startSession(sessionId);
      return {
        success: true,
        message:
          'Sesión de WhatsApp iniciada exitosamente. Escanea el QR si aparece.',
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al iniciar sesión: ' + error.message,
      );
    }
  }

  @Post(':sessionId/restart')
  async restartWhatsAppSession(@Param('sessionId') sessionId: string) {
    try {
      await this.whatsAppSessionManager.recreateSession(sessionId);
      return {
        success: true,
        message: 'Sesión de WhatsApp reiniciada exitosamente.',
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al reiniciar sesión: ' + error.message,
      );
    }
  }

  @Delete(':sessionId/stop')
  async stopWhatsAppSession(@Param('sessionId') sessionId: string) {
    try {
      await this.whatsAppSessionManager.deleteSession(sessionId);
      return {
        success: true,
        message: 'Sesión de WhatsApp detenida exitosamente.',
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al detener sesión: ' + error.message,
      );
    }
  }
}
