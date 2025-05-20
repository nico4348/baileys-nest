export class SessionLogType {
  value: string;

  constructor(value: string) {
    this.value = value;
    this.ensureIsValid();
  }

  private ensureIsValid() {
    if (this.value.length >= 20) {
      throw new Error('SessionLogType must be at most 20 characters long');
    }
    if (this.value.length < 1) {
      throw new Error('SessionLogType must be at least 1 character long');
    }
  }
}
