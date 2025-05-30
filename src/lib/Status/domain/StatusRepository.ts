import { Status } from './Status';
import { StatusId } from './StatusId';
import { StatusName } from './StatusName';

export interface StatusRepository {
  save(status: Status): Promise<void>;
  findAll(): Promise<Status[]>;
  findById(id: StatusId): Promise<Status | null>;
  findByName(name: StatusName): Promise<Status | null>;
  update(status: Status): Promise<void>;
  delete(id: StatusId): Promise<void>;
}
