import { Injectable, Inject } from '@nestjs/common';
import { MessageStatusCreate } from './MessageStatusCreate';
import { StatusRepository } from '../../Status/domain/StatusRepository';
import { StatusName } from '../../Status/domain/StatusName';
import { MessageStatusGetLatestByMessageId } from './MessageStatusGetLatestByMessageId';
import { BaileysStatusMapper } from '../infrastructure/BaileysStatusMapper';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class MessageStatusCreateValidated {
  constructor(
    @Inject(MessageStatusCreate)
    private readonly messageStatusCreate: MessageStatusCreate,
    @Inject('StatusRepository')
    private readonly statusRepository: StatusRepository,
    @Inject(MessageStatusGetLatestByMessageId)
    private readonly messageStatusGetLatest: MessageStatusGetLatestByMessageId,
    private readonly statusMapper: BaileysStatusMapper,
  ) {}

  async run(messageUuid: string): Promise<void> {
    try {
      // Obtener el último estado del mensaje
      const latestStatus = await this.messageStatusGetLatest.run(messageUuid);

      // Verificar si se debe crear el estado validated
      if (
        !this.statusMapper.shouldCreateValidatedStatus(latestStatus?.statusName)
      ) {
        console.log(
          `⏭️ Skipping validated status for message ${messageUuid}: current status is ${latestStatus?.statusName}`,
        );
        return;
      }

      // Obtener el status 'validated'
      const validatedStatus = await this.statusRepository.findByName(
        new StatusName('validated'),
      );
      if (!validatedStatus) {
        throw new Error('Validated status not found in database');
      }

      // Crear el MessageStatus de validado
      await this.messageStatusCreate.run(
        uuidv4(),
        messageUuid,
        validatedStatus.id.value,
        new Date(),
      );

      const progressText = latestStatus
        ? `${latestStatus.statusName} → validated`
        : `initial → validated`;

      console.log(
        `✅ Created MessageStatus for message ${messageUuid}: ${progressText}`,
      );
    } catch (error) {
      console.error(
        `Error creating validated status for ${messageUuid}:`,
        error,
      );
      throw error;
    }
  }
}
