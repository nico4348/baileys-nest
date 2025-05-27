import { Inject, Injectable } from '@nestjs/common';
import { SessionsRepository } from '../domain/SessionsRepository';
import { Session } from '../domain/Session';
import { SessionPhone } from '../domain/SessionPhone';

@Injectable()
export class SessionsGetByPhone {
  constructor(
    @Inject('SessionsRepository')
    private readonly sessionsRepository: SessionsRepository,
  ) {}

  async run(phone: string): Promise<Session[]> {
    try {
      const sessionPhone = new SessionPhone(phone);
      return await this.sessionsRepository.getByPhone(sessionPhone);
    } catch (error) {
      throw new Error(`Failed to get sessions by phone: ${error.message}`);
    }
  }
}
