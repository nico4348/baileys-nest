export class MediaMessageMediaType {
  value: string;

  constructor(value: string) {
    this.value = value;
    this.ensureIsValid();
  }
  private ensureIsValid() {
    const validTypes = [
      'image',
      'video',
      'audio',
      'document',
      'voiceNote',
      'sticker',
    ];
    if (!validTypes.includes(this.value)) {
      throw new Error(
        `MediaMessageMediaType must be one of: ${validTypes.join(', ')}`,
      );
    }
  }
}
