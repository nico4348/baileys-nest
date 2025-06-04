import { Injectable, Inject } from '@nestjs/common';
import { BaileysStatusMapper } from './BaileysStatusMapper';
import { MessageStatusCreate } from '../application/MessageStatusCreate';
import { MessageStatusGetLatestByMessageId } from '../application/MessageStatusGetLatestByMessageId';
import { StatusRepository } from '../../Status/domain/StatusRepository';
import { StatusName } from '../../Status/domain/StatusName';
import { MessagesGetByBaileysId } from '../../Messages/application/MessagesGetByBaileysId';
import { MessageStatusQueue } from './MessageStatusQueue';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class MessageStatusTracker {
  constructor(
    private readonly statusMapper: BaileysStatusMapper,
    @Inject(MessageStatusCreate)
    private readonly messageStatusCreate: MessageStatusCreate,
    @Inject(MessageStatusGetLatestByMessageId)
    private readonly messageStatusGetLatest: MessageStatusGetLatestByMessageId,
    @Inject('StatusRepository')
    private readonly statusRepository: StatusRepository,
    @Inject('MessagesGetByBaileysId')
    private readonly messagesGetByBaileysId: MessagesGetByBaileysId,
    private readonly messageStatusQueue: MessageStatusQueue,
  ) {}

  async trackMessageStatus(
    baileysMessageId: string,
    sessionId: string,
    baileysStatus: number,
    previousStatus: number = 0,
  ): Promise<void> {
    try {
      // Solo actualizar si el estado es mayor (progreso)
      if (!this.statusMapper.shouldUpdateStatus(baileysStatus, previousStatus)) {
        return;
      }

      // Buscar el mensaje en nuestra BD usando el ID de Baileys
      const message = await this.messagesGetByBaileysId.run(baileysMessageId, sessionId);
      if (!message) {
        console.warn(`Message with Baileys ID ${baileysMessageId} not found in database for session ${sessionId}`);
        return;
      }

      const messageUuid = message.id.value;

      // Log del estado
      this.statusMapper.logStatus(baileysMessageId, baileysStatus, previousStatus);

      // Mapear estado de Baileys a nuestro sistema
      const dbStatusName = this.statusMapper.mapBaileysStatusToDb(baileysStatus);
      
      // Obtener el último estado del mensaje
      const latestStatus = await this.messageStatusGetLatest.run(messageUuid);
      
      // Validar si debemos crear el nuevo estado
      if (!this.statusMapper.shouldCreateNewStatus(dbStatusName, latestStatus?.statusName)) {
        console.log(`⏭️ Skipping MessageStatus for message ${messageUuid} (Baileys: ${baileysMessageId}): ${dbStatusName} <= ${latestStatus?.statusName}`);
        return;
      }
      
      // Obtener el status_id de la base de datos
      const status = await this.statusRepository.findByName(new StatusName(dbStatusName));
      if (!status) {
        console.error(`Status '${dbStatusName}' not found in database`);
        return;
      }

      // Queue status update instead of creating directly
      await this.messageStatusQueue.addStatusUpdate({
        messageId: messageUuid,
        statusId: status.id.value,
        sessionId,
        timestamp: new Date(),
        priority: dbStatusName === 'failed' ? 'high' : 'normal',
        baileysMessageId,
        previousStatus: latestStatus?.statusName,
        newStatus: dbStatusName,
      });
      
      const progressText = latestStatus ? 
        `${latestStatus.statusName} → ${dbStatusName}` : 
        `initial → ${dbStatusName}`;
        
      console.log(`📬 Queued MessageStatus update for message ${messageUuid} (Baileys: ${baileysMessageId}): ${progressText}`);
    } catch (error) {
      console.error(`Error tracking message status for Baileys ID ${baileysMessageId}:`, error);
    }
  }

  async handleMessagesUpdate(sessionId: string, updates: any[]): Promise<void> {
    for (const update of updates) {
      if (update.key?.id && update.update?.status !== undefined) {
        const messageId = update.key.id;
        const newStatus = update.update.status;
        const previousStatus = update.update.status - 1; // Estimación del estado anterior
        
        await this.trackMessageStatus(messageId, sessionId, newStatus, previousStatus);
      }
    }
  }
}