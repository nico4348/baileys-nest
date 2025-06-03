export class MessageFromMe {
  constructor(public readonly value: boolean) {}

  static create(value: boolean): MessageFromMe {
    return new MessageFromMe(value);
  }

  static fromOutgoing(): MessageFromMe {
    return new MessageFromMe(true);
  }

  static fromIncoming(): MessageFromMe {
    return new MessageFromMe(false);
  }
}