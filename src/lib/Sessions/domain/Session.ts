import { SessionCreatedAt } from './SessionCreatedAt';
import { SessionId } from './SessionId';
import { SessionIsDeleted } from './SessionIsDeleted';
import { SessionName } from './SessionName';
import { SessionPhone } from './SessionPhone';
import { SessionStatus } from './SessionStatus';
import { SessionUpdatedAt } from './SessionUpdatedAt';
import { SessionDeletedAt } from './SessionDeletedAt';
import { SessionRateLimit } from './SessionRateLimit';
export class Session {
  id: SessionId;
  sessionName: SessionName;
  phone: SessionPhone;
  status: SessionStatus;
  createdAt: SessionCreatedAt;
  updatedAt: SessionUpdatedAt;
  isDeleted: SessionIsDeleted;
  deletedAt: SessionDeletedAt;
  rateLimit: SessionRateLimit;

  constructor(
    id: SessionId,
    sessionName: SessionName,
    phone: SessionPhone,
    status: SessionStatus,
    createdAt: SessionCreatedAt,
    updatedAt: SessionUpdatedAt,
    isDeleted: SessionIsDeleted,
    deletedAt: SessionDeletedAt,
    rateLimit: SessionRateLimit,
  ) {
    this.id = id;
    this.sessionName = sessionName;
    this.phone = phone;
    this.status = status;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.isDeleted = isDeleted;
    this.deletedAt = deletedAt;
    this.rateLimit = rateLimit;
  }
  public toPlainObject() {
    return {
      id: this.id.value,
      sessionName: this.sessionName.value,
      phone: this.phone.value,
      status: this.status.value,
      createdAt: this.createdAt.value,
      updatedAt: this.updatedAt.value,
      rateLimit: this.rateLimit.getValue(),
    };
  }
}
