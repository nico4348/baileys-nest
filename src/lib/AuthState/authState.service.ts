import {
  Controller,
  Post,
  Body,
  Param,
  Delete,
  Inject,
  InternalServerErrorException,
} from '@nestjs/common';
import { AuthStateService } from './application/AuthStateService';
import { randomUUID } from 'crypto';

@Controller('auth')
export class AuthStateController {
  constructor(
    @Inject('AuthStateService')
    private readonly authStateService: AuthStateService,
  ) {}

  @Post()
  async create(@Body() body) {
    try {
      const sessionId = randomUUID();
      const state = await this.authStateService.getAuthState(sessionId);
      return {
        success: true,
        sessionId,
        created_at: new Date(),
        updated_at: new Date(),
      };
    } catch (error) {
      console.error('Error creating auth state:', error);
      throw new InternalServerErrorException(
        `Failed to create auth state: ${error.message}`,
      );
    }
  }

  @Post(':sessionId')
  async initializeSession(@Param('sessionId') sessionId: string) {
    try {
      const state = await this.authStateService.getAuthState(sessionId);
      return { success: true, sessionId };
    } catch (error) {
      console.error('Error initializing session:', error);
      throw new InternalServerErrorException(
        `Failed to initialize session: ${error.message}`,
      );
    }
  }

  @Delete(':sessionId')
  async deleteSession(@Param('sessionId') sessionId: string) {
    try {
      await this.authStateService.deleteSession(sessionId);
      return { success: true, sessionId };
    } catch (error) {
      console.error('Error deleting session:', error);
      throw new InternalServerErrorException(
        `Failed to delete session: ${error.message}`,
      );
    }
  }
}
