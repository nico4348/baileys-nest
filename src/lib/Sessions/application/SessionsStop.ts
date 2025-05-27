import { SessionsRepository } from '../domain/SessionsRepository';
import { SessionsGetOneById } from './SessionsGetOneById';
import { SessionsUpdate } from './SessionsUpdate';

export class SessionsStop {
  constructor(
    private readonly sessionsRepository: SessionsRepository,
    private readonly sessionsGetOneById: SessionsGetOneById,
    private readonly sessionsUpdate: SessionsUpdate,
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

    // Actualizar estado a inactivo
    await this.sessionsUpdate.run(
      session.id.value,
      session.sessionName.value,
      session.phone.value,
      false,
      session.createdAt.value,
      new Date(),
      session.isDeleted.value,
      session.deletedAt.value || undefined,
    );

    console.log(`Sesión ${sessionId} pausada`);
  }
}
