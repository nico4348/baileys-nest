import { StatusId } from '../domain/StatusId';
import { StatusRepository } from '../domain/StatusRepository';

export class StatusDelete {
  constructor(private readonly repository: StatusRepository) {}

  async run(id: string): Promise<void> {
    return this.repository.delete(new StatusId(id));
  }
}
