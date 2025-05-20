export class TextMessageBody {
  value: string;

  constructor(value: string) {
    this.value = value;
    this.ensureIsValid();
  }

  private ensureIsValid() {
    if (this.value.length >= 4096) {
      throw new Error('TextMessageBody must be less than 4096 characters');
    }
  }
}
