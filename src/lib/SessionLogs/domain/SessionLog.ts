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
  readonly metadata?: Record<string, any>;

  constructor(
    id: SessionLogId,
    sessionId: SessionLogSessionId,
    logType: SessionLogLogType,
    message: SessionLogMessage,
    createdAt: SessionLogCreatedAt,
    metadata?: Record<string, any>,
  ) {
    this.id = id;
    this.sessionId = sessionId;
    this.logType = logType;
    this.message = message;
    this.createdAt = createdAt;
    this.metadata = metadata;
  }

  static create(
    sessionId: string,
    logType: string,
    message: string,
    metadata?: Record<string, any>,
  ): SessionLog {
    return new SessionLog(
      SessionLogId.generate(),
      new SessionLogSessionId(sessionId),
      new SessionLogLogType(logType),
      new SessionLogMessage(message),
      SessionLogCreatedAt.now(),
      metadata,
    );
  }

  withMetadata(metadata: Record<string, any>): SessionLog {
    return new SessionLog(
      this.id,
      this.sessionId,
      this.logType,
      this.message,
      this.createdAt,
      { ...this.metadata, ...metadata },
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
}
