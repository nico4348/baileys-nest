export class MediaMessageMimeType {
  value: string;

  constructor(value: string) {
    this.value = value;
    this.ensureIsValid();
  }

  private ensureIsValid() {
    const validMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'video/mp4',
      'video/webm',
      'audio/mpeg',
      'audio/wav',
      'audio/ogg',
      'audio/ogg; codecs=opus',
    ];

    if (!validMimeTypes.includes(this.value)) {
      throw new Error(`Invalid MediaMessageMimeType: ${this.value}`);
    }
  }
}
