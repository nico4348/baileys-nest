import { SessionCreatedAt } from './SessionCreatedAt';
import { SessionId } from './SessionId';
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

  constructor(
    id: SessionId,
    session_name: SessionName,
    phone: SessionPhone,
    status: SessionStatus,
    created_at: SessionCreatedAt,
    updated_at: SessionUpdatedAt,
  ) {
    this.id = id;
    this.session_name = session_name;
    this.phone = phone;
    this.status = status;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }
}
