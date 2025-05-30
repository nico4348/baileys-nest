export class MediaMessageMimeType {
  value: string;

  constructor(value: string) {
    this.value = value;
    this.ensureIsValid();
  }

  private ensureIsValid() {
    if (!this.value || typeof this.value !== 'string' || this.value.trim().length === 0) {
      throw new Error('MediaMessageMimeType cannot be empty');
    }
  }
}
