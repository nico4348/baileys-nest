import { Status } from './Status';
import { StatusId } from './StatusId';
import { StatusName } from './StatusName';

export interface StatusRepository {
  create(status: Status): Promise<void>;
  getAll(): Promise<Status[]>;
  getOneById(id: StatusId): Promise<Status | null>;
  getOneByName(name: StatusName): Promise<Status | null>;
  update(status: Status): Promise<void>;
  delete(id: StatusId): Promise<void>;
}
