import { Injectable, Inject } from '@nestjs/common';
import { Session } from '../domain/Session';
import { SessionsRepository } from '../domain/SessionsRepository';
import { SessionIsDeleted } from '../domain/SessionIsDeleted';

@Injectable()
export class SessionsGetByIsDeleted {
  constructor(
    @Inject('SessionsRepository')
    private readonly repository: SessionsRepository,
  ) {}

  async run(isDeleted: boolean): Promise<Session[]> {
    try {
      const sessionIsDeleted = new SessionIsDeleted(isDeleted);
      return await this.repository.getByIsDeleted(sessionIsDeleted);
    } catch (error) {
      throw new Error(
        `Failed to get sessions by isDeleted status: ${error.message}`,
      );
    }
  }
}
