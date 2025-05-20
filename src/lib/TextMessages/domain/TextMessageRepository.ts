import { TextMessageBody } from './TextMessageBody';
import { TextMessageId } from './TextMessageId';

export interface TextMessageRepository {
  create(textMessage: TextMessageBody): Promise<void>;
  getAll(): Promise<TextMessageBody[]>;
  getOneById(id: TextMessageId): Promise<TextMessageBody | null>;
  edit(textMessage: TextMessageBody): Promise<void>;
  delete(id: TextMessageId): Promise<void>;
  deleteAll(): Promise<void>;
}
