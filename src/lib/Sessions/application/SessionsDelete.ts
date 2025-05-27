import { SessionDeletedAt } from '../domain/SessionDeletedAt';
import { SessionId } from '../domain/SessionId';
import { SessionsRepository } from '../domain/SessionsRepository';
import { SessionsGetOneById } from './SessionsGetOneById';

export class SessionsDelete {
  constructor(
    private readonly sessionsRepository: SessionsRepository,
    private readonly sessionsGetOneById: SessionsGetOneById,
  ) {}

  async run(sessionId: string): Promise<void> {
    const session = await this.sessionsGetOneById.run(sessionId);
    if (!session) {
      throw new Error(`Sesión ${sessionId} no encontrada en la base de datos`);
    }
    if (session.isDeleted.value) {
      throw new Error(
        `Sesión ${sessionId} ha sido eliminada y no está disponible`,
      );
    }

    // Realizar soft delete
    await this.sessionsRepository.softDelete(
      new SessionId(sessionId),
      new SessionDeletedAt(new Date()),
    );
    console.log(`Sesión ${sessionId} SoftDeleteada`);
  }
}
