import { randomUUID } from 'node:crypto';

export class SessionLogId {
  readonly value: string;

  constructor(value: string) {
    this.value = value;
    this.ensureIsValid();
  }

  private ensureIsValid() {
    if (!this.value) {
      throw new Error('SessionLogId cannot be empty');
    }
    
    // UUID validation pattern
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidPattern.test(this.value)) {
      throw new Error('SessionLogId must be a valid UUID');
    }
  }

  static generate(): SessionLogId {
    return new SessionLogId(randomUUID());
  }

  equals(other: SessionLogId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
