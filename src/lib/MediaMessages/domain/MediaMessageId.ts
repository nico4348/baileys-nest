export class MediaMessageId {
  value: string;

  constructor(value: string) {
    this.value = value;
    this.ensureIsValid();
  }

  private ensureIsValid() {
    if (!this.value) {
      throw new Error('MediaMessageId cannot be empty');
    }
    if (this.value.length < 10) {
      throw new Error('MediaMessageId must be at least 10 characters long');
    }
  }
}
