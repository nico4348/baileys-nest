import { SessionLogId } from './SessionLogId';
import { SessionLogSessionId } from './SessionLogSessionId';
import { SessionLogLogType } from './SessionLogLogType';
import { SessionLogMessage } from './SessionLogMessage';
import { SessionLogCreatedAt } from './SessionLogCreatedAt';

export class SessionLog {
  readonly id: SessionLogId;
  readonly sessionId: SessionLogSessionId;
  readonly logType: SessionLogLogType;
  readonly message: SessionLogMessage;
  readonly createdAt: SessionLogCreatedAt;

  constructor(
    id: SessionLogId,
    sessionId: SessionLogSessionId,
    logType: SessionLogLogType,
    message: SessionLogMessage,
    createdAt: SessionLogCreatedAt,
  ) {
    this.id = id;
    this.sessionId = sessionId;
    this.logType = logType;
    this.message = message;
    this.createdAt = createdAt;
  }
  static create(
    sessionId: string,
    logType: string,
    message: string,
  ): SessionLog {
    return new SessionLog(
      SessionLogId.generate(),
      new SessionLogSessionId(sessionId),
      new SessionLogLogType(logType),
      new SessionLogMessage(message),
      SessionLogCreatedAt.now(),
    );
  }

  isOfType(logType: SessionLogLogType): boolean {
    return this.logType.equals(logType);
  }

  isError(): boolean {
    return this.logType.value === 'ERROR';
  }

  isWarning(): boolean {
    return this.logType.value === 'WARNING';
  }
  isInfo(): boolean {
    return this.logType.value === 'INFO';
  }
  toJSON(): any {
    return {
      id: this.id.toString(),
      sessionId: this.sessionId.value,
      logType: this.logType.toString(),
      message: this.message.value,
      createdAt: this.createdAt.toString(),
    };
  }
}
