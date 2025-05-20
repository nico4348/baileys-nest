export class StatusName {
  value: string;

  constructor(value: string) {
    this.value = value;
    this.ensureIsValid();
  }

  private ensureIsValid() {
    if (this.value.length < 3 || this.value.length > 50) {
      throw new Error('StatusName must be between 3 and 50 characters');
    }
  }
}
