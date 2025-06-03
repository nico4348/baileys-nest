export class SessionMediaCreatedAt {
  constructor(private readonly value: Date) {
    if (!value) {
      throw new Error('SessionMediaCreatedAt cannot be empty');
    }
  }

  toDate(): Date {
    return this.value;
  }

  equals(other: SessionMediaCreatedAt): boolean {
    return this.value.getTime() === other.value.getTime();
  }
}