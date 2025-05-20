export class SessionStatus {
  value: boolean;

  constructor(value: boolean) {
    this.value = value;
    this.ensureIsValid();
  }

  private ensureIsValid() {
    if (typeof this.value !== 'boolean') {
      throw new Error('SessionStatus must be a boolean');
    }
  }
}
