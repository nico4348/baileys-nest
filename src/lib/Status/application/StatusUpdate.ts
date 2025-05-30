import { Status } from '../domain/Status';
import { StatusCreatedAt } from '../domain/StatusCreatedAt';
import { StatusDescription } from '../domain/StatusDescription';
import { StatusId } from '../domain/StatusId';
import { StatusName } from '../domain/StatusName';
import { StatusRepository } from '../domain/StatusRepository';

export class StatusUpdate {
  constructor(private repository: StatusRepository) {}

  async run(
    id: string,
    name: string,
    description: string,
  ): Promise<void> {
    // Primero obtener el status existente para preservar created_at
    const existingStatus = await this.repository.findById(new StatusId(id));
    if (!existingStatus) {
      throw new Error('Status not found');
    }

    const status = new Status(
      new StatusId(id),
      new StatusName(name),
      new StatusDescription(description),
      existingStatus.created_at,
    );
    await this.repository.update(status);
  }
}
