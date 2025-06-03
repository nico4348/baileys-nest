export class SessionMediaSessionId {
  constructor(private readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('SessionMediaSessionId cannot be empty');
    }
  }

  toString(): string {
    return this.value;
  }

  equals(other: SessionMediaSessionId): boolean {
    return this.value === other.value;
  }
}