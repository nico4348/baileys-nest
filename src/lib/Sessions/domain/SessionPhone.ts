export class SessionPhone {
  value: string;

  constructor(value: string) {
    this.value = value;
    this.ensureIsValid();
  }

  private ensureIsValid() {
    if (this.value.length >= 15) {
      throw new Error('SessionPhone must be at most 15 characters long');
    }
    if (this.value.length < 1) {
      throw new Error('SessionPhone must be at least 1 character long');
    }
  }
}
