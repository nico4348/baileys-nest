// // src/lib/SessionLogs/infrastructure/WhatsAppLogger.ts (anteriormente en wsp.ts)
// import { Injectable } from '@nestjs/common';
// import { proto } from 'baileys';
// // import { CreateSessionLog } from '../application/CreateSessionLog'; // Tu caso de uso para guardar logs de sesión
// import { SessionLog } from '../domain/SessionLog';
// import { SessionLogId } from '../domain/SessionLogId';
// import { SessionLogLogType } from '../domain/SessionLogLogType';
// import { SessionLogMessage } from '../domain/SessionLogMessage';
// import { SessionId } from '../../Sessions/domain/SessionId'; // Necesitas el VO SessionId

// // Para loggear los estados de los mensajes, usarás un caso de uso de MessageStatus
// // NO se usará EventLogs/Events para el log de estado de mensajes, ya que MessageStatus ya existe
// import { UpdateMessageStatus } from '../../MessageStatus/application/UpdateMessageStatus';
// import { randomUUID } from 'node:crypto';

// @Injectable()
// export class WhatsAppLogger {
//   private readonly names: Record<number, string> = {
//     0: 'Mensaje Usuario Recibido',
//     1: 'Respuesta Validada',
//     [proto.WebMessageInfo.Status.SERVER_ACK]: 'Enviado al Servidor',
//     [proto.WebMessageInfo.Status.DELIVERY_ACK]: 'Entregado al Destinatario',
//     [proto.WebMessageInfo.Status.READ]: 'Leído',
//     [proto.WebMessageInfo.Status.PLAYED]: 'Reproducido',
//     6: 'Entrega Fallida',
//   };

//   private lastStatus = new Map<string, number>();

//   constructor(
//     private readonly createSessionLog: CreateSessionLog,
//     private readonly updateMessageStatus: UpdateMessageStatus, // Inyectar el caso de uso
//   ) {}

//   async logStatus(msgId: string, status: number, sessionId: string) {
//     const prev = this.lastStatus.get(msgId) || 0;
//     if (status > prev) {
//       const message = `➡️ Mensaje ${msgId}: ${this.names[status] || status}`;
//       console.log(message);
//       this.lastStatus.set(msgId, status);

//       // También puedes usar el UpdateMessageStatus aquí para reflejar el estado en la DB
//       let statusNameForDB: string;
//       switch (status) {
//         case 0:
//           statusNameForDB = 'RECEIVED';
//           break; // Un estado para el mensaje inicial recibido
//         case 1:
//           statusNameForDB = 'VALIDATED';
//           break; // Un estado para la respuesta validada
//         case proto.WebMessageInfo.Status.SERVER_ACK:
//           statusNameForDB = 'SERVER_ACK';
//           break;
//         case proto.WebMessageInfo.Status.DELIVERY_ACK:
//           statusNameForDB = 'DELIVERY_ACK';
//           break;
//         case proto.WebMessageInfo.Status.READ:
//           statusNameForDB = 'READ';
//           break;
//         case proto.WebMessageInfo.Status.PLAYED:
//           statusNameForDB = 'PLAYED';
//           break;
//         case 6:
//           statusNameForDB = 'FAILED';
//           break;
//         default:
//           statusNameForDB = 'UNKNOWN';
//           break;
//       }
//       await this.updateMessageStatus.execute(msgId, statusNameForDB);

//       // Opcional: También podrías querer registrar esto en `session_logs` si es un evento de auditoría general
//       // await this.createSessionLog.execute(
//       //     new SessionLog(
//       //         new SessionLogId(randomUUID()),
//       //         new SessionId(sessionId),
//       //         new SessionLogLogType("MESSAGE_STATUS_UPDATE"),
//       //         new SessionLogMessage(message),
//       //         new Date()
//       //     )
//       // );
//     }
//   }

//   async logSessionEvent(sessionId: string, logType: string, message: string) {
//     const sessionLog = new SessionLog(
//       new SessionLogId(randomUUID()),
//       new SessionId(sessionId),
//       new SessionLogLogType(logType),
//       new SessionLogMessage(message),
//       new Date(),
//     );
//     await this.createSessionLog.execute(sessionLog);
//     console.log(`[${sessionId}] ${logType}: ${message}`);
//   }
// }
