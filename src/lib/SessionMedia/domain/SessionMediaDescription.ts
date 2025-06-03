export class SessionMediaDescription {
  constructor(private readonly value: string) {
    if (value && value.length > 4096) {
      throw new Error('SessionMediaDescription cannot exceed 4096 characters');
    }
  }

  toString(): string {
    return this.value || '';
  }

  equals(other: SessionMediaDescription): boolean {
    return this.value === other.value;
  }
}