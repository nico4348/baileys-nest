import { Session } from '../domain/Session';
import { SessionCreatedAt } from '../domain/SessionCreatedAt';
import { SessionId } from '../domain/SessionId';
import { SessionIsDeleted } from '../domain/SessionIsDeleted';
import { SessionName } from '../domain/SessionName';
import { SessionPhone } from '../domain/SessionPhone';
import { SessionsRepository } from '../domain/SessionsRepository';
import { SessionStatus } from '../domain/SessionStatus';
import { SessionUpdatedAt } from '../domain/SessionUpdatedAt';
import { SessionDeletedAt } from '../domain/SessionDeletedAt';

export class SessionsCreate {
  constructor(private repository: SessionsRepository) {}
  async run(
    id: string,
    sessionName: string,
    phone: string,
    status: boolean,
    createdAt: Date,
    updatedAt: Date,
    isDeleted: boolean,
    deletedAt: Date | null = null,
  ): Promise<void> {
    const session = new Session(
      new SessionId(id),
      new SessionName(sessionName),
      new SessionPhone(phone),
      new SessionStatus(status),
      new SessionCreatedAt(createdAt),
      new SessionUpdatedAt(updatedAt),
      new SessionIsDeleted(isDeleted),
      new SessionDeletedAt(deletedAt),
    );

    await this.repository.create(session);
  }
}
