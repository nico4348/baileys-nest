export class SessionIsDeleted {
  value: boolean;

  constructor(value: boolean) {
    this.value = value;
    this.ensureIsValid();
  }

  private ensureIsValid() {
    if (typeof this.value !== 'boolean') {
      throw new Error('SessionIsDeleted must be a boolean');
    }
  }
}
