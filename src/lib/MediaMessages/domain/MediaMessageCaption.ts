export class MediaMessageCaption {
  value: string | null;

  constructor(value: string | null) {
    this.value = value;
    this.ensureIsValid();
  }

  private ensureIsValid() {
    if (this.value && this.value.length >= 4096) {
      throw new Error('MediaMessageCaption must be less than 4096 characters');
    }
  }
}
