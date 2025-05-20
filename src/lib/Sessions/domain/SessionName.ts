export class SessionName {
  value: string;

  constructor(value: string) {
    this.value = value;
    this.ensureIsValid();
  }

  private ensureIsValid() {
    if (this.value.length >= 100) {
      throw new Error('SessionName must be at most 100 characters long');
    }
    if (this.value.length < 1) {
      throw new Error('SessionName must be at least 1 character long');
    }
  }
}
