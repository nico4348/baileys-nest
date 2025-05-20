export class ReactionMessageEmoji {
  value: string;

  constructor(value: string) {
    this.value = value;
    this.ensureIsValid();
  }

  private ensureIsValid() {
    if (this.value.length >= 20) {
      throw new Error('ReactionMessageEmoji must be less than 20 characters');
    }
    if (this.value.length < 1) {
      throw new Error('ReactionMessageEmoji must be at least 1 character long');
    }
  }
}
