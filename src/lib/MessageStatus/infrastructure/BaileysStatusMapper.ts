import { Injectable } from '@nestjs/common';
import { proto } from 'baileys';

@Injectable()
export class BaileysStatusMapper {
  private readonly statusMapping: Record<number, string> = {
    0: 'pending',
    1: 'pending',
    [proto.WebMessageInfo.Status.SERVER_ACK]: 'sent',
    [proto.WebMessageInfo.Status.DELIVERY_ACK]: 'delivered', 
    [proto.WebMessageInfo.Status.READ]: 'read',
    [proto.WebMessageInfo.Status.PLAYED]: 'played',
    6: 'failed',
  };

  // Orden jerárquico de estados (menor número = estado anterior)
  private readonly statusHierarchy: Record<string, number> = {
    'pending': 0,
    'sent': 1,
    'delivered': 2,
    'read': 3,
    'played': 4,
    'failed': 99, // failed puede ocurrir en cualquier momento
  };

  private readonly statusNames: Record<number, string> = {
    0: 'Mensaje Usuario Recibido',
    1: 'Respuesta Validada',
    [proto.WebMessageInfo.Status.SERVER_ACK]: 'Enviado al Servidor',
    [proto.WebMessageInfo.Status.DELIVERY_ACK]: 'Entregado al Destinatario',
    [proto.WebMessageInfo.Status.READ]: 'Leído',
    [proto.WebMessageInfo.Status.PLAYED]: 'Reproducido',
    6: 'Entrega Fallida',
  };

  mapBaileysStatusToDb(baileysStatus: number): string {
    return this.statusMapping[baileysStatus] || 'pending';
  }

  getStatusName(baileysStatus: number): string {
    return this.statusNames[baileysStatus] || `Estado ${baileysStatus}`;
  }

  shouldUpdateStatus(newStatus: number, previousStatus: number): boolean {
    return newStatus > previousStatus;
  }

  logStatus(msgId: string, status: number, prev: number = 0): void {
    if (this.shouldUpdateStatus(status, prev)) {
      console.log(`➡️ Mensaje ${msgId}: ${this.getStatusName(status)}`);
    }
  }

  getStatusHierarchyLevel(statusName: string): number {
    return this.statusHierarchy[statusName] ?? -1;
  }

  shouldCreateNewStatus(newStatusName: string, currentStatusName?: string): boolean {
    // Si no hay estado actual, siempre crear
    if (!currentStatusName) {
      return true;
    }

    const newLevel = this.getStatusHierarchyLevel(newStatusName);
    const currentLevel = this.getStatusHierarchyLevel(currentStatusName);

    // Solo crear si el nuevo estado es superior o si es 'failed'
    return newLevel > currentLevel || newStatusName === 'failed';
  }

  isStatusProgression(newStatusName: string, currentStatusName: string): boolean {
    const newLevel = this.getStatusHierarchyLevel(newStatusName);
    const currentLevel = this.getStatusHierarchyLevel(currentStatusName);
    
    return newLevel > currentLevel;
  }
}