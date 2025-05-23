import { Session } from '../domain/Session';
import { SessionCreatedAt } from '../domain/SessionCreatedAt';
import { SessionId } from '../domain/SessionId';
import { SessionIsDeleted } from '../domain/SessionIsDeleted';
import { SessionName } from '../domain/SessionName';
import { SessionPhone } from '../domain/SessionPhone';
import { SessionsRepository } from '../domain/SessionsRepository';
import { SessionStatus } from '../domain/SessionStatus';
import { SessionUpdatedAt } from '../domain/SessionUpdatedAt';

export class SessionsUpdate {
  constructor(private repository: SessionsRepository) {}

  async run(
    id: string,
    session_name: string,
    phone: string,
    status: boolean,
    created_at: Date,
    updated_at: Date,
    is_deleted: boolean,
  ): Promise<void> {
    const session = new Session(
      new SessionId(id),
      new SessionName(session_name),
      new SessionPhone(phone),
      new SessionStatus(status),
      new SessionCreatedAt(created_at),
      new SessionUpdatedAt(updated_at),
      new SessionIsDeleted(is_deleted),
    );
    await this.repository.update(session);
  }
}
