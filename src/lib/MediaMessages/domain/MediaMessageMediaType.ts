export class MediaMessageMediaType {
  value: string;

  constructor(value: string) {
    this.value = value;
    this.ensureIsValid();
  }

  private ensureIsValid() {
    const validTypes = ['image', 'video', 'audio'];
    if (!validTypes.includes(this.value)) {
      throw new Error(
        'MediaMessageMediaType must be one of: image, video, audio',
      );
    }
  }
}
