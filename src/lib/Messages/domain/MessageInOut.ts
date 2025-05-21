export class MessageInOut {
  value: string;

  constructor(value: string) {
    this.value = value;
    this.ensureIsValid();
  }

  private ensureIsValid() {
    if (this.value !== 'in' && this.value !== 'out') {
      throw new Error('MessageInOut must be either "in" or "out"');
    }
  }
}
