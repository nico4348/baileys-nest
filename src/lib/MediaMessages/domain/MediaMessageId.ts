export class MediaMessageId {
  value: string;

  constructor(value: string) {
    this.value = value;
    this.ensureIsValid();
  }

  private ensureIsValid() {
    if (this.value.length < 5) {
      throw new Error('MediaMessageId must be at least 5 characters long');
    }
  }
}
