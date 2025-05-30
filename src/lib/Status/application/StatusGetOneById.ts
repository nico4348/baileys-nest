import { Status } from '../domain/Status';
import { StatusId } from '../domain/StatusId';
import { StatusRepository } from '../domain/StatusRepository';

export class StatusGetOneById {
  constructor(private readonly repository: StatusRepository) {}

  async run(id: string): Promise<Status | null> {
    return this.repository.findById(new StatusId(id));
  }
}
