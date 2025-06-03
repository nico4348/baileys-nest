export class SessionMediaId {
  constructor(private readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('SessionMediaId cannot be empty');
    }
  }

  toString(): string {
    return this.value;
  }

  equals(other: SessionMediaId): boolean {
    return this.value === other.value;
  }
}