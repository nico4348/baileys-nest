export class SessionUpdatedAt {
  value: Date;

  constructor(value: Date) {
    this.value = value;
    this.ensureIsValid();
  }

  private ensureIsValid() {
    if (this.value > new Date()) {
      throw new Error('SessionUpdatedAt must be in the past');
    }
  }
}
