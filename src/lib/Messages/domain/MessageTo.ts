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
  }
}
