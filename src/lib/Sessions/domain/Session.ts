import { SessionCreatedAt } from './SessionCreatedAt';
import { SessionId } from './SessionId';
import { SessionIsDeleted } from './SessionIsDeleted';
import { SessionName } from './SessionName';
import { SessionPhone } from './SessionPhone';
import { SessionStatus } from './SessionStatus';
import { SessionUpdatedAt } from './SessionUpdatedAt';

export class Session {
  id: SessionId;
  session_name: SessionName;
  phone: SessionPhone;
  status: SessionStatus;
  created_at: SessionCreatedAt;
  updated_at: SessionUpdatedAt;
  is_deleted: SessionIsDeleted;

  constructor(
    id: SessionId,
    session_name: SessionName,
    phone: SessionPhone,
    status: SessionStatus,
    created_at: SessionCreatedAt,
    updated_at: SessionUpdatedAt,
    is_deleted: SessionIsDeleted,
  ) {
    this.id = id;
    this.session_name = session_name;
    this.phone = phone;
    this.status = status;
    this.created_at = created_at;
    this.updated_at = updated_at;
    this.is_deleted = is_deleted;
  }
}
