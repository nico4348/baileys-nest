import { Status } from '../domain/Status';
import { StatusName } from '../domain/StatusName';
import { StatusRepository } from '../domain/StatusRepository';

export class StatusGetOneByName {
  constructor(private readonly repository: StatusRepository) {}

  async run(name: string): Promise<Status | null> {
    return this.repository.findByName(new StatusName(name));
  }
}
