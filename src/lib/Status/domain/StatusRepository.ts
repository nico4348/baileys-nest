import { Status } from '../StatusEntity';
import { StatusId } from './StatusId';

export interface StatusRepository {
  create(status: Status): Promise<void>;
  getAll(): Promise<Status[]>;
  getOneById(id: StatusId): Promise<Status | null>;
  edit(status: Status): Promise<void>;
  delete(id: StatusId): Promise<void>;
}
