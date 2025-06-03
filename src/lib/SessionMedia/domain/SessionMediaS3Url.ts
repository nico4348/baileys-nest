export class SessionMediaS3Url {
  constructor(private readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('SessionMediaS3Url cannot be empty');
    }
  }

  toString(): string {
    return this.value;
  }

  equals(other: SessionMediaS3Url): boolean {
    return this.value === other.value;
  }
}