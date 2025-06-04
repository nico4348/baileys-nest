export class SessionMediaIsUploaded {
  constructor(private readonly value: boolean) {}

  toString(): boolean {
    return this.value;
  }

  toBoolean(): boolean {
    return this.value;
  }

  static fromBoolean(value: boolean): SessionMediaIsUploaded {
    return new SessionMediaIsUploaded(value);
  }

  static default(): SessionMediaIsUploaded {
    return new SessionMediaIsUploaded(false);
  }
}