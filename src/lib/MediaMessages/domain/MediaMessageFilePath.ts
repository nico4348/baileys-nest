export class MediaMessageFilePath {
  value: string;

  constructor(value: string) {
    this.value = value;
    this.ensureIsValid();
  }

  private ensureIsValid() {
    if (!this.value.startsWith('file://')) {
      throw new Error('MediaMessageFilePath must start with "file://"');
    }
  }
}
