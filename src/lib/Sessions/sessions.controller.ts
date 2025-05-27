// src/lib/Sessions/sessions.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Delete,
  Body,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { SessionsCreate } from './application/SessionsCreate';
import { SessionsGetAll } from './application/SessionsGetAll';
import { SessionsGetOneById } from './application/SessionsGetOneById';
import { SessionsGetOneByPhone } from './application/SessionsGetOneByPhone';
import { SessionsGetByStatus } from './application/SessionsGetByStatus';
import { SessionsUpdate } from './application/SessionsUpdate';
import { SessionsDelete } from './application/SessionsDelete';
import { SessionsHardDelete } from './application/SessionsHardDelete';
import { WhatsAppSessionManager } from './infrastructure/WhatsAppSessionManager';
import { randomUUID } from 'crypto';

@Controller('sessions')
export class SessionsController {
  constructor(
    @Inject('SessionsCreate') private readonly sessionsCreate: SessionsCreate,
    @Inject('SessionsGetAll') private readonly sessionsGetAll: SessionsGetAll,
    @Inject('SessionsGetOneById')
    private readonly sessionsGetOneById: SessionsGetOneById,
    @Inject('SessionsGetOneByPhone')
    private readonly sessionsGetOneByPhone: SessionsGetOneByPhone,
    @Inject('SessionsGetByStatus')
    private readonly sessionsGetByStatus: SessionsGetByStatus,
    @Inject('SessionsUpdate') private readonly sessionsUpdate: SessionsUpdate,
    @Inject('SessionsDelete') private readonly sessionsDelete: SessionsDelete,
    @Inject('SessionsHardDelete')
    private readonly sessionsHardDelete: SessionsHardDelete,
    private readonly whatsAppSessionManager: WhatsAppSessionManager,
  ) {}

  @Get()
  async getAllSessions() {
    try {
      const sessions = await this.sessionsGetAll.run();
      return {
        success: true,
        message: 'Sesiones obtenidas exitosamente.',
        data: sessions.map((session) => session.toPlainObject()),
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al obtener sesiones: ' + error.message,
      );
    }
  }

  @Get(':sessionId')
  async getSessionById(@Param('sessionId') sessionId: string) {
    try {
      const session = await this.sessionsGetOneById.run(sessionId);
      if (!session) {
        throw new NotFoundException('Sesión no encontrada');
      }
      return {
        success: true,
        message: 'Sesión obtenida exitosamente.',
        data: session.toPlainObject(),
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Error al obtener sesión: ' + error.message,
      );
    }
  }

  @Get('phone/:phone')
  async getSessionByPhone(@Param('phone') phone: string) {
    try {
      const session = await this.sessionsGetOneByPhone.run(phone);
      if (!session) {
        throw new NotFoundException(
          'Sesión no encontrada para este número de teléfono',
        );
      }
      return {
        success: true,
        message: 'Sesión obtenida exitosamente.',
        data: session.toPlainObject(),
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Error al obtener sesión por teléfono: ' + error.message,
      );
    }
  }

  @Get('status/:status')
  async getSessionsByStatus(@Param('status') status: string) {
    try {
      const statusBoolean = status.toLowerCase() === 'true';
      const sessions = await this.sessionsGetByStatus.run(statusBoolean);
      return {
        success: true,
        message: 'Sesiones obtenidas exitosamente.',
        data: sessions.map((session) => session.toPlainObject()),
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al obtener sesiones por estado: ' + error.message,
      );
    }
  }
  @Post('create')
  async create(
    @Body() body: { session_name: string; phone: string },
  ): Promise<{ success: boolean; sessionId: string; message?: string }> {
    // Validar que los campos requeridos están presentes
    if (!body.session_name || !body.phone) {
      throw new BadRequestException(
        'Los campos session_name y phone son requeridos',
      );
    }

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
  @Post(':sessionId/pause')
  async pauseWhatsAppSession(@Param('sessionId') sessionId: string) {
    try {
      await this.whatsAppSessionManager.pauseSession(sessionId);
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

  @Put(':sessionId')
  async updateSession(
    @Param('sessionId') sessionId: string,
    @Body()
    body: {
      session_name?: string;
      phone?: string;
      status?: boolean;
    },
  ) {
    try {
      const existingSession = await this.sessionsGetOneById.run(sessionId);
      if (!existingSession) {
        throw new NotFoundException('Sesión no encontrada');
      }
      await this.sessionsUpdate.run(
        sessionId,
        body.session_name || existingSession.sessionName.value,
        body.phone || existingSession.phone.value,
        body.status !== undefined ? body.status : existingSession.status.value,
        existingSession.createdAt.value,
        new Date(), // updatedAt
        existingSession.isDeleted.value,
        existingSession.deletedAt?.value || undefined,
      ); // Obtener la sesión actualizada
      const updatedSession = await this.sessionsGetOneById.run(sessionId);

      if (!updatedSession) {
        throw new InternalServerErrorException(
          'Error al obtener la sesión actualizada',
        );
      }

      return {
        success: true,
        message: 'Sesión actualizada exitosamente.',
        data: updatedSession.toPlainObject(),
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Error al actualizar sesión: ' + error.message,
      );
    }
  }

  @Delete(':sessionId/hard')
  async hardDeleteSession(@Param('sessionId') sessionId: string) {
    try {
      const existingSession = await this.sessionsGetOneById.run(sessionId);
      if (!existingSession) {
        throw new NotFoundException('Sesión no encontrada');
      }

      await this.sessionsHardDelete.run(sessionId);
      return {
        success: true,
        message: 'Sesión eliminada permanentemente.',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Error al eliminar sesión permanentemente: ' + error.message,
      );
    }
  }
  @Get(':sessionId/qr')
  async getSessionQR(@Param('sessionId') sessionId: string) {
    try {
      // Verificar que la sesión existe
      const session = await this.sessionsGetOneById.run(sessionId);
      if (!session) {
        throw new InternalServerErrorException('Sesión no encontrada');
      }

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

  @Get(':sessionId/qr/status')
  async getQRCounterStatus(@Param('sessionId') sessionId: string) {
    try {
      // Verificar que la sesión existe
      const session = await this.sessionsGetOneById.run(sessionId);
      if (!session) {
        throw new NotFoundException('Sesión no encontrada');
      }

      // Get QR counter information from the WhatsAppSessionManager
      const qrCounterManager =
        this.whatsAppSessionManager.getQrCounterManager();

      const currentCount = qrCounterManager.getCurrentCount(sessionId);
      const maxLimit = qrCounterManager.getMaxLimit();
      const remainingAttempts =
        qrCounterManager.getRemainingAttempts(sessionId);
      const hasExceededLimit = qrCounterManager.hasExceededLimit(sessionId);
      const canGenerateQr = qrCounterManager.canGenerateQr(sessionId);

      return {
        success: true,
        message: 'Estado del contador QR obtenido exitosamente.',
        data: {
          sessionId,
          currentQrCount: currentCount,
          maxQrLimit: maxLimit,
          remainingAttempts,
          hasExceededLimit,
          canGenerateMoreQr: canGenerateQr,
          status: hasExceededLimit ? 'LIMIT_EXCEEDED' : 'ACTIVE',
        },
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Error al obtener estado del contador QR: ' + error.message,
      );
    }
  }
}
