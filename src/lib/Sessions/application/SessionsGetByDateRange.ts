import { Injectable, Inject } from '@nestjs/common';
import { Session } from '../domain/Session';
import { SessionsRepository } from '../domain/SessionsRepository';

@Injectable()
export class SessionsGetByDateRange {
  constructor(
    @Inject('SessionsRepository')
    private readonly repository: SessionsRepository,
  ) {}

  async runByCreatedAt(
    startDate: Date,
    endDate: Date,
    limit?: number,
    offset?: number,
  ): Promise<Session[]> {
    try {
      return await this.repository.getByCreatedAtRange(
        startDate,
        endDate,
        limit,
        offset,
      );
    } catch (error) {
      throw new Error(
        `Failed to get sessions by created at range: ${error.message}`,
      );
    }
  }

  async runByUpdatedAt(
    startDate: Date,
    endDate: Date,
    limit?: number,
    offset?: number,
  ): Promise<Session[]> {
    try {
      return await this.repository.getByUpdatedAtRange(
        startDate,
        endDate,
        limit,
        offset,
      );
    } catch (error) {
      throw new Error(
        `Failed to get sessions by updated at range: ${error.message}`,
      );
    }
  }
}
