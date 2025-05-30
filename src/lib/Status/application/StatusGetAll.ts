import { Status } from '../domain/Status';
import { StatusRepository } from '../domain/StatusRepository';

export class StatusGetAll {
  constructor(private readonly repository: StatusRepository) {}

  async run(): Promise<Status[]> {
    return this.repository.findAll();
  }
}
