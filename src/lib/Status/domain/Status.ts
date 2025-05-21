import { StatusCreatedAt } from './StatusCreatedAt';
import { StatusDescription } from './StatusDescription';
import { StatusId } from './StatusId';
import { StatusName } from './StatusName';

export class Status {
  readonly id: StatusId;
  readonly name: StatusName;
  readonly description: StatusDescription;
  readonly created_at: StatusCreatedAt;

  constructor(
    id: StatusId,
    name: StatusName,
    description: StatusDescription,
    created_at: StatusCreatedAt,
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.created_at = created_at;
  }
}
