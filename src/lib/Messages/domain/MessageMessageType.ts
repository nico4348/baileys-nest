export class MessageMessageType {
  value: string;

  constructor(value: string) {
    this.value = value;
    this.ensureIsValid();
  }

  private ensureIsValid() {
    const validTypes = ['txt', 'media', 'react'];
    if (!validTypes.includes(this.value)) {
      throw new Error(
        `MessageMessageType must be one of: ${validTypes.join(', ')}`,
      );
    }
  }
}
