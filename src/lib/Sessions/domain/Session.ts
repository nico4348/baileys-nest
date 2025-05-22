import { SessionCreatedAt } from './SessionCreatedAt';
import { SessionId } from './SessionId';
import { SessionIsDeleted } from './SessionIsDeleted';
import { SessionName } from './SessionName';
import { SessionPhone } from './SessionPhone';
import { SessionStatus } from './SessionStatus';
import { SessionUpdatedAt } from './SessionUpdatedAt';

export class Session {
  id: SessionId;
  sessionName: SessionName;
  phone: SessionPhone;
  status: SessionStatus;
  createdAt: SessionCreatedAt;
  updatedAt: SessionUpdatedAt;
  isDeleted: SessionIsDeleted;

  constructor(
    id: SessionId,
    sessionName: SessionName,
    phone: SessionPhone,
    status: SessionStatus,
    createdAt: SessionCreatedAt,
    updatedAt: SessionUpdatedAt,
    isDeleted: SessionIsDeleted,
  ) {
    this.id = id;
    this.sessionName = sessionName;
    this.phone = phone;
    this.status = status;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.isDeleted = isDeleted;
  }
}
