import { Status } from '../domain/Status';
import { StatusCreatedAt } from '../domain/StatusCreatedAt';
import { StatusDescription } from '../domain/StatusDescription';
import { StatusId } from '../domain/StatusId';
import { StatusName } from '../domain/StatusName';
import { StatusRepository } from '../domain/StatusRepository';

export class StatusCreate {
  constructor(private readonly repository: StatusRepository) {}
  async run(
    id: string,
    name: string,
    description: string,
    createdAt: Date,
  ): Promise<void> {
    const status = new Status(
      new StatusId(id),
      new StatusName(name),
      new StatusDescription(description),
      new StatusCreatedAt(createdAt),
    );

    await this.repository.save(status);
  }
}
