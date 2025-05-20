export class SessionLogMessage {
  value: string;

  constructor(value: string) {
    this.value = value;
    this.ensureIsValid();
  }

  private ensureIsValid() {
    if (this.value.length >= 500) {
      throw new Error('SessionLogMessage must be at most 500 characters long');
    }
    if (this.value.length < 1) {
      throw new Error('SessionLogMessage must be at least 1 character long');
    }
  }
}
