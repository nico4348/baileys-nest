import { Injectable, Inject } from '@nestjs/common';
import { MessageStatusCreate } from './MessageStatusCreate';
import { StatusRepository } from '../../Status/domain/StatusRepository';
import { StatusName } from '../../Status/domain/StatusName';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class MessageStatusCreateMessageReceipt {
  constructor(
    @Inject(MessageStatusCreate)
    private readonly messageStatusCreate: MessageStatusCreate,
    @Inject('StatusRepository')
    private readonly statusRepository: StatusRepository,
  ) {}

  async run(messageUuid: string): Promise<void> {
    try {
      // Obtener el status 'message_receipt'
      const messageReceiptStatus = await this.statusRepository.findByName(
        new StatusName('message_receipt'),
      );
      if (!messageReceiptStatus) {
        throw new Error('Message_receipt status not found in database');
      }

      // Crear el MessageStatus inicial
      await this.messageStatusCreate.run(
        uuidv4(),
        messageUuid,
        messageReceiptStatus.id.value,
        new Date(),
      );

      console.log(
        `📥 Created MessageStatus for message ${messageUuid} with status: message_receipt`,
      );
    } catch (error) {
      console.error(
        `Error creating message_receipt status for ${messageUuid}:`,
        error,
      );
      throw error;
    }
  }
}
