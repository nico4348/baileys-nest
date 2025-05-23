export class AuthStateData {
  private readonly _value: Record<string, any>;

  constructor(value: Record<string, any>) {
    this._value = value;
    this.ensureIsValid();
  }

  private ensureIsValid() {
    if (!this._value || Object.keys(this._value).length === 0) {
      throw new Error('SessionId must be a non-empty JSON object');
    }
  }
}
