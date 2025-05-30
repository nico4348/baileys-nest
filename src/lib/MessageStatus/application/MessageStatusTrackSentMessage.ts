import { Injectable, Inject } from '@nestjs/common';
import { MessageStatusCreate } from './MessageStatusCreate';
import { StatusRepository } from '../../Status/domain/StatusRepository';
import { StatusName } from '../../Status/domain/StatusName';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class MessageStatusTrackSentMessage {
  constructor(
    @Inject(MessageStatusCreate)
    private readonly messageStatusCreate: MessageStatusCreate,
    @Inject('StatusRepository')
    private readonly statusRepository: StatusRepository,
  ) {}

  async run(messageUuid: string): Promise<void> {
    try {
      // Obtener el status 'pending' para mensajes recién enviados
      const pendingStatus = await this.statusRepository.findByName(new StatusName('pending'));
      if (!pendingStatus) {
        throw new Error('Pending status not found in database');
      }

      // Crear el MessageStatus inicial
      await this.messageStatusCreate.run(
        uuidv4(),
        messageUuid,
        pendingStatus.id.value,
        new Date(),
      );

      console.log(`📤 Created initial MessageStatus for sent message ${messageUuid} with status: pending`);
    } catch (error) {
      console.error(`Error creating initial message status for ${messageUuid}:`, error);
    }
  }
}