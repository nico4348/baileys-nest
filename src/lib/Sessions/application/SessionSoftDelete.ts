import { SessionDeletedAt } from '../domain/SessionDeletedAt';
import { SessionId } from '../domain/SessionId';
import { SessionsRepository } from '../domain/SessionsRepository';

export class SessionSoftDelete {
  constructor(private readonly repository: SessionsRepository) {}

  async run(id: string, deletedAt: Date): Promise<void> {
    return this.repository.softDelete(
      new SessionId(id),
      new SessionDeletedAt(deletedAt),
    );
  }
}
