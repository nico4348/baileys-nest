export class SessionLogCreatedAt {
  readonly value: Date;

  constructor(value: Date) {
    this.value = value;
    this.ensureIsValid();
  }

  private ensureIsValid() {
    if (!(this.value instanceof Date) || isNaN(this.value.getTime())) {
      throw new Error('SessionLogCreatedAt must be a valid Date');
    }

    // Allow some tolerance for clock differences (5 minutes in the future)
    const now = new Date();
    const tolerance = 5 * 60 * 1000; // 5 minutes in milliseconds
    if (this.value.getTime() > now.getTime() + tolerance) {
      throw new Error('SessionLogCreatedAt cannot be too far in the future');
    }
  }

  static now(): SessionLogCreatedAt {
    return new SessionLogCreatedAt(new Date());
  }

  static fromString(dateString: string): SessionLogCreatedAt {
    return new SessionLogCreatedAt(new Date(dateString));
  }

  equals(other: SessionLogCreatedAt): boolean {
    return this.value.getTime() === other.value.getTime();
  }

  isAfter(other: SessionLogCreatedAt): boolean {
    return this.value.getTime() > other.value.getTime();
  }

  isBefore(other: SessionLogCreatedAt): boolean {
    return this.value.getTime() < other.value.getTime();
  }

  toString(): string {
    return this.value.toISOString();
  }
  toLocaleString(): string {
    return this.value.toLocaleString();
  }

  toJSON(): string {
    return this.value.toISOString();
  }
}
