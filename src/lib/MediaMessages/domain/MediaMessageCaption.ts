export class MediaMessageCaption {
  value: string;

  constructor(value: string) {
    this.value = value;
    this.ensureIsValid();
  }

  private ensureIsValid() {
    if (this.value.length >= 4096) {
      throw new Error('MediaMessageCaption must be less than 4096 characters');
    }
    if (this.value.length < 1) {
      throw new Error('MediaMessageCaption must be at least 1 character long');
    }
  }
}
