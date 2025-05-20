export class MessageTo {
  value: string;

  constructor(value: string) {
    this.value = value;
    this.ensureIsValid();
  }

  private ensureIsValid() {
    if (!/^\d+$/.test(this.value)) {
      throw new Error('MessageTo must contain only numeric characters');
    }

    if (this.value.length >= 50) {
      throw new Error('MessageTo must be at most 50 characters long');
    }

    if (this.value.length < 1) {
      throw new Error('MessageTo must be at least 1 character long');
    }
  }
}
