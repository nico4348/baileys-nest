import { SessionLogId } from './SessionLogId';
import { SessionLogSessionId } from './SessionLogSessionId';
import { SessionLogLogType } from './SessionLogLogType';
import { SessionLogMessage } from './SessionLogMessage';
import { SessionLogCreatedAt } from './SessionLogCreatedAt';

export class SessionLog {
  id: SessionLogId;
  session_id: SessionLogSessionId;
  log_type: SessionLogLogType;
  message: SessionLogMessage;
  created_at: SessionLogCreatedAt;

  constructor(
    id: SessionLogId,
    session_id: SessionLogSessionId,
    log_type: SessionLogLogType,
    message: SessionLogMessage,
    created_at: SessionLogCreatedAt,
  ) {
    this.id = id;
    this.session_id = session_id;
    this.log_type = log_type;
    this.message = message;
    this.created_at = created_at;
  }
}
