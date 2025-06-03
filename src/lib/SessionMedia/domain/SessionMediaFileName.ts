export class SessionMediaFileName {
  constructor(private readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('SessionMediaFileName cannot be empty');
    }
    if (value.length > 255) {
      throw new Error('SessionMediaFileName cannot exceed 255 characters');
    }
  }

  toString(): string {
    return this.value;
  }

  equals(other: SessionMediaFileName): boolean {
    return this.value === other.value;
  }
}