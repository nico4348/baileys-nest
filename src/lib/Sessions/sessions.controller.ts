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
import { randomUUID } from 'crypto';

@Controller('sessions')
export class SessionsController {
  constructor(
    @Inject('SessionsCreate') private readonly sessionsCreate: SessionsCreate,
  ) {}

  //   id: SessionId;
  //   session_name: SessionName;
  //   phone: SessionPhone;
  //   status: SessionStatus;
  //   created_at: SessionCreatedAt;
  //   updated_at: SessionUpdatedAt;
  //   is_deleted: SessionIsDeleted;

  @Post()
  async create(@Body() body) {
    const generatedId = randomUUID();
    return await this.sessionsCreate.run(
      generatedId,
      body.session_name,
      body.phone,
      true,
      new Date(),
      new Date(),
      false,
    );
  }

  // @Post('start')
  // async startSession(@Body() startSessionDto) {
  //   try {
  //     const { phone, authFolder, sessionName } = startSessionDto;
  //     const sessionId = await this.sessionStartSocket.start({
  //       phone,
  //       authFolder,
  //       sessionName,
  //     });
  //     return { sessionId };
  //   } catch (error) {
  //     console.error('Error starting session:', error);
  //     throw new InternalServerErrorException(
  //       `Failed to start session: ${error.message}`,
  //     );
  //   }
  // }

  // @Post('start-all')
  // async startAllSessions() {
  //   try {
  //     const sessions = await this.findAllSessions.execute();
  //     const results = [];

  //     for (const session of sessions) {
  //       try {
  //         const sessionId = await this.startWhatsAppSession.execute({
  //           phone: session.phone,
  //           authFolder: session.authFolder,
  //           sessionName: session.name,
  //         });
  //         results.push({
  //           phone: session.phone,
  //           sessionId: sessionId,
  //           status: 'initializing',
  //         });
  //       } catch (error) {
  //         results.push({
  //           phone: session.phone,
  //           error: error.message,
  //           status: 'failed',
  //         });
  //       }
  //     }

  //     return {
  //       message: 'Attempted to start all sessions',
  //       results: results,
  //     };
  //   } catch (error) {
  //     console.error('Error starting all sessions:', error);
  //     throw new InternalServerErrorException(
  //       `Failed to start all sessions: ${error.message}`,
  //     );
  //   }
  // }

  // @Delete(':id')
  // async deleteSession(@Param('id') id: string) {
  //   try {
  //     await this.softDeleteSession.execute({ id });
  //     return { message: `Session with ID ${id} soft deleted.` };
  //   } catch (error) {
  //     console.error('Error deleting session:', error);
  //     throw new InternalServerErrorException(
  //       `Failed to delete session: ${error.message}`,
  //     );
  //   }
  // }

  // @Get('by-phone/:phone')
  // async getSessionByPhone(@Param('phone') phone: string) {
  //   try {
  //     const session = await this.findSessionByPhone.execute(phone);
  //     if (!session) {
  //       throw new NotFoundException(`Session for phone ${phone} not found.`);
  //     }
  //     return session.toPrimitives(); // Return the primitive representation of the domain entity
  //   } catch (error) {
  //     console.error('Error fetching session by phone:', error);
  //     if (error instanceof NotFoundException) {
  //       throw error;
  //     }
  //     throw new InternalServerErrorException(
  //       `Failed to fetch session: ${error.message}`,
  //     );
  //   }
  // }

  // @Get(':id')
  // async getSessionById(@Param('id') id: string) {
  //   try {
  //     const session = await this.findSessionById.execute(id);
  //     if (!session) {
  //       throw new NotFoundException(`Session with ID ${id} not found.`);
  //     }
  //     return session.toPrimitives(); // Return the primitive representation of the domain entity
  //   } catch (error) {
  //     console.error('Error fetching session by ID:', error);
  //     if (error instanceof NotFoundException) {
  //       throw error;
  //     }
  //     throw new InternalServerErrorException(
  //       `Failed to fetch session: ${error.message}`,
  //     );
  //   }
  // }
}
