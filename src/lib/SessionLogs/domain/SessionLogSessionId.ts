export class SessionLogSessionId {
  value: string;

  constructor(value: string) {
    this.value = value;
    this.ensureIsValid();
  }
  private ensureIsValid() {
    if (this.value.length < 5) {
      throw new Error('SessionLogSessionId must be at least 5 characters long');
    }
  }

  toJSON(): string {
    return this.value;
  }
}
