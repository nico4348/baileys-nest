import { SessionsRepository } from '../domain/SessionsRepository';
import { SessionsGetOneById } from './SessionsGetOneById';
import { SessionsUpdate } from './SessionsUpdate';

export class SessionsResume {
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

    // Actualizar estado a activo
    await this.sessionsUpdate.run(
      session.id.value,
      session.sessionName.value,
      session.phone.value,
      true,
      session.createdAt.value,
      new Date(),
      session.isDeleted.value,
      session.deletedAt.value || undefined,
      session.rateLimit.getValue(),
      session.rateLimitWindow.getValue(),
    );

    console.log(`Reanudando sesión ${sessionId}`);
  }
}
