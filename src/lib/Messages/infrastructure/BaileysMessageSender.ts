// // src/lib/Messages/infrastructure/BaileysMessageSender.ts
// import { Injectable } from '@nestjs/common';
// import { proto, type WASocket } from 'baileys';
// import * as path from 'path';
// import { lookup } from 'mime-types';
// import {
//   MediaPayload,
//   TextPayload,
//   ReactPayload,
// } from '../domain/MessagePayload'; // Tus VOs
// import { MessageValidatorService } from './MessageValidatorService'; // El servicio de validación
// import { SocketManager } from '../../Sessions/infrastructure/SocketManager'; // Adaptador para obtener el socket

// @Injectable()
// export class BaileysMessageSender {
//   // Cambiado a Sender para claridad
//   constructor(
//     private readonly messageValidatorService: MessageValidatorService,
//     private readonly socketManager: SocketManager,
//   ) {}

//   private getSocket(sessionId: string): WASocket {
//     return this.socketManager.getSocket(sessionId);
//   }

//   async sendTextMessage(
//     sessionId: string,
//     msgId: string, // ID para el log de Baileys
//     jid: string,
//     payload: TextPayload,
//   ): Promise<proto.WebMessageInfo | null> {
//     // Devuelve el objeto de Baileys
//     const sock = this.getSocket(sessionId);
//     const { text, quoted } = payload;
//     if (this.messageValidatorService.textValidator(text)) {
//       // this.whatsAppLogger.logStatus(msgId, 1); // La persistencia del log la maneja el caso de uso/logger
//       const msg = await sock.sendMessage(jid, { text }, { quoted });
//       // this.whatsAppLogger.logStatus(msgId, 2);
//       return msg;
//     } else {
//       // this.whatsAppLogger.logStatus(msgId, 6);
//       return null;
//     }
//   }

//   async sendMediaMessage(
//     sessionId: string,
//     msgId: string,
//     jid: string,
//     mediaType: string,
//     payload: MediaPayload,
//   ): Promise<proto.WebMessageInfo | null> {
//     const sock = this.getSocket(sessionId);
//     const { url, caption, quoted } = payload;

//     // La lógica de validación de archivos es compleja y requiere acceso al sistema de archivos.
//     // Si `url` es una URL externa, la validación de tamaño y duración es más complicada.
//     // Asumo que `url` es una ruta de archivo local para `fs.statSync`.
//     // Para URLs remotas, necesitarías descargar encabezados o el archivo completo para validar.

//     let isValid = false;
//     if (mediaType === 'audio' || mediaType === 'voiceNote') {
//       isValid = await this.messageValidatorService.audioDurationValidator(url);
//     } else if (mediaType === 'document') {
//       isValid = this.messageValidatorService.size2GbValidator(url);
//     } else {
//       // image, video, sticker
//       isValid = this.messageValidatorService.size16MbValidator(url);
//     }

//     if (!isValid) {
//       // this.whatsAppLogger.logStatus(msgId, 6);
//       return null;
//     }

//     // this.whatsAppLogger.logStatus(msgId, 1);
//     let msg: proto.WebMessageInfo | null = null;
//     switch (mediaType) {
//       case 'voiceNote':
//         msg = await sock.sendMessage(
//           jid,
//           { audio: { url }, ptt: true },
//           { quoted },
//         );
//         break;
//       case 'audio':
//         msg = await sock.sendMessage(jid, { audio: { url } }, { quoted });
//         break;
//       case 'video':
//         msg = await sock.sendMessage(
//           jid,
//           { video: { url }, caption },
//           { quoted },
//         );
//         break;
//       case 'image':
//         msg = await sock.sendMessage(
//           jid,
//           { image: { url }, caption },
//           { quoted },
//         );
//         break;
//       case 'sticker':
//         msg = await sock.sendMessage(jid, { sticker: { url } }, { quoted });
//         break;
//       case 'document':
//         const fileName = path.basename(url);
//         const mimetype = lookup(url) || 'application/octet-stream';
//         msg = await sock.sendMessage(
//           jid,
//           {
//             document: { url },
//             caption,
//             fileName,
//             mimetype,
//           },
//           { quoted },
//         );
//         break;
//       default:
//         console.log('Tipo de media no soportado:', mediaType);
//         break;
//     }
//     // this.whatsAppLogger.logStatus(msgId, 2);
//     return msg;
//   }

//   async sendReactMessage(
//     sessionId: string,
//     msgId: string,
//     jid: string,
//     payload: ReactPayload,
//   ): Promise<proto.WebMessageInfo | null> {
//     const sock = this.getSocket(sessionId);
//     const { key, emoji } = payload;
//     const msg = await sock.sendMessage(jid, {
//       react: { key: key, text: emoji },
//     });
//     return msg;
//   }
// }
