export class MessageInOut {
  value: string;

  constructor(value: string) {
    this.value = value;
    this.ensureIsValid();
  }

  private ensureIsValid() {
    if (this.value.length > 3) {
      throw new Error('MessageInOut must be at most 3 characters long');
    }
  }
}
