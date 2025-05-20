export class StatusDescription {
  value: string;

  constructor(value: string) {
    this.value = value;
    this.ensureIsValid();
  }

  private ensureIsValid() {
    if (this.value.length > 255) {
      throw new Error('StatusDescription must be less than 255 characters');
    }
  }
}
