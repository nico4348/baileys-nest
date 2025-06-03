export class SessionMediaType {
  constructor(private readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('SessionMediaType cannot be empty');
    }
    if (value.length > 50) {
      throw new Error('SessionMediaType cannot exceed 50 characters');
    }
  }

  toString(): string {
    return this.value;
  }

  equals(other: SessionMediaType): boolean {
    return this.value === other.value;
  }
}