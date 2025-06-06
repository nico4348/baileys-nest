export class SessionRateLimit {
  private readonly value: number;

  constructor(value: number) {
    this.ensureIsValid(value);
    this.value = value;
  }

  private ensureIsValid(value: number): void {
    if (value == null || value == undefined) {
      throw new Error('SessionRateLimit cannot be null or undefined');
    }

    if (!Number.isInteger(value)) {
      throw new Error('SessionRateLimit must be an integer');
    }

    if (value < 1) {
      throw new Error('SessionRateLimit must be greater than 0');
    }

    if (value > 1000) {
      throw new Error('SessionRateLimit cannot exceed 1000 messages per minute');
    }
  }

  getValue(): number {
    return this.value;
  }

  static fromPrimitive(value: number): SessionRateLimit {
    return new SessionRateLimit(value);
  }

  static default(): SessionRateLimit {
    const defaultValue = parseInt(process.env.DEFAULT_RATE_LIMIT || '30');
    return new SessionRateLimit(defaultValue);
  }

  isHighRateLimit(): boolean {
    return this.value > 60;
  }

  isLowRateLimit(): boolean {
    return this.value < 10;
  }

  equals(other: SessionRateLimit): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value.toString();
  }
}