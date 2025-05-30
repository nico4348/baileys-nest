import { Injectable, Inject } from '@nestjs/common';
import { MessageStatusId } from '../domain/MessageStatusId';
import { MessageStatusRepository } from '../domain/MessageStatusRepository';

@Injectable()
export class MessageStatusDelete {
  constructor(
    @Inject('MessageStatusRepository')
    private readonly repository: MessageStatusRepository,
  ) {}

  async run(id: string): Promise<void> {
    return this.repository.delete(new MessageStatusId(id));
  }
}
