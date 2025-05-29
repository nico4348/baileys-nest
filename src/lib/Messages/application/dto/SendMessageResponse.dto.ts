export class SendMessageResponse {
  success: boolean;
  messageId: string;
  childMessageId?: string;
  timestamp: Date;
  messageType: string;
  error?: string;

  constructor(
    success: boolean,
    messageId: string,
    messageType: string,
    childMessageId?: string,
    error?: string
  ) {
    this.success = success;
    this.messageId = messageId;
    this.messageType = messageType;
    this.childMessageId = childMessageId;
    this.timestamp = new Date();
    this.error = error;
  }

  static success(messageId: string, messageType: string, childMessageId?: string): SendMessageResponse {
    return new SendMessageResponse(true, messageId, messageType, childMessageId);
  }

  static error(error: string, messageType: string): SendMessageResponse {
    return new SendMessageResponse(false, '', messageType, undefined, error);
  }
}