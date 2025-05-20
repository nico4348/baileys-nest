export class ReactionMessageId {
  value: string;

  constructor(value: string) {
    this.value = value;
    this.ensureIsValid();
  }

  private ensureIsValid() {
    if (!this.value) {
      throw new Error('ReactionMessageId cannot be empty');
    }
    if (this.value.length > 255) {
      throw new Error('ReactionMessageId cannot be longer than 255 characters');
    }
  }
}
