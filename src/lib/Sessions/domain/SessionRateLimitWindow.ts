export class SessionRateLimitWindow {
  private readonly value: number;

  constructor(value: number) {
    this.ensureIsValid(value);
    this.value = value;
  }

  private ensureIsValid(value: number): void {
    if (value == null || value == undefined) {
      throw new Error('SessionRateLimitWindow cannot be null or undefined');
    }

    if (!Number.isInteger(value)) {
      throw new Error('SessionRateLimitWindow must be an integer');
    }

    if (value < 1) {
      throw new Error('SessionRateLimitWindow must be greater than 0');
    }

    if (value > 3600) {
      throw new Error('SessionRateLimitWindow cannot exceed 3600 seconds (1 hour)');
    }
  }

  getValue(): number {
    return this.value;
  }

  static fromPrimitive(value: number): SessionRateLimitWindow {
    return new SessionRateLimitWindow(value);
  }

  static default(): SessionRateLimitWindow {
    const defaultValue = parseInt(process.env.DEFAULT_RATE_WINDOW || '60');
    return new SessionRateLimitWindow(defaultValue);
  }

  isShortWindow(): boolean {
    return this.value < 30;
  }

  isLongWindow(): boolean {
    return this.value > 300;
  }

  equals(other: SessionRateLimitWindow): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value.toString();
  }
}