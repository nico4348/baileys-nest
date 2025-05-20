export class EventName {
  value: string;

  constructor(value: string) {
    this.value = value;
    this.ensureIsValid();
  }

  private ensureIsValid() {
    if (this.value.length >= 50) {
      throw new Error('EventName must be at most 50 characters long');
    }
    if (this.value.length < 1) {
      throw new Error('EventName must be at least 1 character long');
    }
  }
}
