export class EventCreatedAt {
  value: Date;

  constructor(value: Date) {
    this.value = value;
    this.ensureIsValid();
  }

  private ensureIsValid() {
    if (this.value > new Date()) {
      throw new Error('EventCreatedAt must be in the past');
    }
  }
}
