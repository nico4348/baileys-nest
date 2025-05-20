import { SessionId } from './SessionId';
import { SessionName } from './SessionName';
import { SessionPhone } from './SessionPhone';
import { SessionStatus } from './SessionStatus';

export class Session {
  id: SessionId;
  session_name: SessionName;
  phone: SessionPhone;
  status: SessionStatus;
  created_at: Date;
  updated_at: Date;

  constructor(
    id: SessionId,
    session_name: SessionName,
    phone: SessionPhone,
    status: SessionStatus,
    created_at: Date,
    updated_at: Date,
  ) {
    this.id = id;
    this.session_name = session_name;
    this.phone = phone;
    this.status = status;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }
}
