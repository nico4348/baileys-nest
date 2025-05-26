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

  @Post(':sessionId/resume')
  async resumeWhatsAppSession(@Param('sessionId') sessionId: string) {
    try {
      await this.whatsAppSessionManager.resumeSession(sessionId);
      return {
        success: true,
        message: 'Sesión de WhatsApp reanudada exitosamente.',
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al reanudar sesión: ' + error.message,
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
      await this.whatsAppSessionManager.stopSession(sessionId);
      return {
        success: true,
        message: 'Sesión de WhatsApp pausada exitosamente.',
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al pausar sesión: ' + error.message,
      );
    }
  }
  @Delete(':sessionId/delete')
  async deleteWhatsAppSession(@Param('sessionId') sessionId: string) {
    try {
      await this.whatsAppSessionManager.deleteSession(sessionId);
      return {
        success: true,
        message: 'Sesión de WhatsApp eliminada exitosamente.',
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al eliminar sesión: ' + error.message,
      );
    }
  }
  @Get(':sessionId/qr')
  async getSessionQR(@Param('sessionId') sessionId: string) {
    try {
      const qrCode = this.whatsAppSessionManager.getSessionQR(sessionId);
      const hasQR = this.whatsAppSessionManager.hasSessionQR(sessionId);

      if (!hasQR) {
        return {
          success: false,
          message: 'No hay código QR disponible para esta sesión.',
          qrCode: null,
        };
      }

      return {
        success: true,
        message: 'Código QR obtenido exitosamente.',
        qrCode: qrCode,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al obtener código QR: ' + error.message,
      );
    }
  }

  @Get(':sessionId/qr/image')
  async getSessionQRAsImage(@Param('sessionId') sessionId: string) {
    try {
      const hasQR = this.whatsAppSessionManager.hasSessionQR(sessionId);

      if (!hasQR) {
        return {
          success: false,
          message: 'No hay código QR disponible para esta sesión.',
          qrImage: null,
        };
      }

      const qrImage =
        await this.whatsAppSessionManager.getSessionQRAsBase64(sessionId);

      return {
        success: true,
        message: 'Imagen QR obtenida exitosamente.',
        qrImage: qrImage,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al obtener imagen QR: ' + error.message,
      );
    }
  }
}
