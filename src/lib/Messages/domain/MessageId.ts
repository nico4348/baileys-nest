export class MessageId {
  value: string;

  constructor(value: string) {
    this.value = value;
    this.ensureIsValid();
  }

  private ensureIsValid() {
    if (!this.value || this.value.trim().length === 0) {
      throw new Error('MessageId cannot be empty');
    }
    if (this.value.length < 5) {
      throw new Error('MessageId must be at least 5 characters long');
    }
  }
}
