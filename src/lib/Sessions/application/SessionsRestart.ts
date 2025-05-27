import { SessionsRepository } from '../domain/SessionsRepository';
import { SessionsGetOneById } from './SessionsGetOneById';
import { SessionsUpdate } from './SessionsUpdate';

export class SessionsRestart {
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
    } // Actualizar updatedAt cuando se reinicia la sesión
    await this.sessionsUpdate.run(
      session.id.value,
      session.sessionName.value,
      session.phone.value,
      true, // Activar sesión al reiniciarla
      session.createdAt.value,
      new Date(), // updatedAt actual
      session.isDeleted.value,
      session.deletedAt.value || undefined,
    );

    console.log(`🔄 Reiniciando sesión ${sessionId}`);
  }
}
