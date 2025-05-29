export class MessageId {
  value: string;

  constructor(value: string) {
    this.value = value;
    this.ensureIsValid();
  }

  private ensureIsValid() {
    if (this.value.length < 36) {
      throw new Error('MessageId must be a valid UUID');
    }
  }
}
