export enum SessionLogType {
  CONNECTION = 'CONNECTION',
  DISCONNECTION = 'DISCONNECTION',
  QR_GENERATED = 'QR_GENERATED',
  AUTH_SUCCESS = 'AUTH_SUCCESS',
  AUTH_FAILURE = 'AUTH_FAILURE',
  ERROR = 'ERROR',
  WARNING = 'WARNING',
  INFO = 'INFO',
  SESSION_START = 'SESSION_START',
  SESSION_STOP = 'SESSION_STOP',
  SESSION_PAUSE = 'SESSION_PAUSE',
  SESSION_RESUME = 'SESSION_RESUME',
  RECONNECTION = 'RECONNECTION',
  MESSAGE_SENT = 'MESSAGE_SENT',
  MESSAGE_RECEIVED = 'MESSAGE_RECEIVED',
  MESSAGE_FAILED = 'MESSAGE_FAILED',
}

export class SessionLogLogType {
  readonly value: SessionLogType;

  constructor(value: string | SessionLogType) {
    if (typeof value === 'string') {
      if (!Object.values(SessionLogType).includes(value as SessionLogType)) {
        throw new Error(`Invalid log type: ${value}`);
      }
      this.value = value as SessionLogType;
    } else {
      this.value = value;
    }
  }

  static fromString(value: string): SessionLogLogType {
    return new SessionLogLogType(value);
  }

  toString(): string {
    return this.value;
  }
  equals(other: SessionLogLogType): boolean {
    return this.value === other.value;
  }

  toJSON(): string {
    return this.value;
  }
}
