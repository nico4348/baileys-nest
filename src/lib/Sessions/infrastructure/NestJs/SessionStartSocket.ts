// // src/lib/Sessions/infrastructure/BaileysSessionManager.ts
// import { Injectable } from '@nestjs/common';
// import { Boom } from '@hapi/boom';
// import NodeCache from '@cacheable/node-cache';
// import makeWASocket, {
//   fetchLatestBaileysVersion,
//   Browsers,
//   DisconnectReason,
//   proto,
//   useMultiFileAuthState,
//   makeCacheableSignalKeyStore,
//   isJidNewsletter,
// } from 'baileys';
// import * as P from 'pino';
// // import * as fs from 'fs/promises';
// // import { DownloadMediaMessage } from '../../MediaMessages/application/DownloadMediaMessage'; // Caso de uso para descargar y persistir media
// // import { SendMessageUseCase } from '../../Messages/application/SendMessageUseCase'; // Caso de uso para enviar y persistir mensaje
// // import { UpdateSessionStatus } from '../application/SessionStatusUpdate'; // Caso de uso para actualizar estado de sesión
// // import { SessionSoftDelete } from '../application/SessionSoftDelete'; // Caso de uso para soft delete de sesión
// // import { MessageCreate } from '../../Messages/application/MessagesCreate'; // Caso de uso para crear Message en DB
// // import { MessageStatusUpdate } from '../../MessageStatus/application/MessageStatusUpdate'; // Caso de uso para actualizar estado de mensaje

// // // Importar Payloads
// // import {
// //   MediaPayload,
// //   TextPayload,
// //   ReactPayload,
// // } from '../../Messages/domain/MessagePayload';

// // Value Objects
// import { SessionId } from '../../domain/SessionId';
// import { Session } from '../../domain/Session';
// import { SessionsCreate } from '../../application/SessionsCreate';
// // import { SessionName } from '../domain/SessionName';
// // import { SessionPhone } from '../domain/SessionPhone';
// // import {
// //   SessionStatus,
// //   SessionStatus as SessionStatusVO,
// // } from '../domain/SessionStatus';
// // import { MessageId } from '../../Messages/domain/MessageId';
// // import { MessageType } from '../../Messages/domain/MessageType';
// // import { MessageInOut } from '../../Messages/domain/MessageInOut';
// // import { Message } from '../../Messages/domain/Message';
// // import { MessageQuotedMessageId } from '../../Messages/domain/MessageQuotedMessageId';

// interface NumberConfig {
//   number: string;
//   authFolder: string;
// }

// @Injectable()
// export class SessionStartSocket {
//   // Renombrado de WhatsAppBotService
//   private sock: ReturnType<typeof makeWASocket> | null = null;
//   private logger = P.pino(
//     { timestamp: () => `,'time':'${new Date().toISOString()}'` },
//     P.destination('./wa-logs.txt'),
//   );
//   private retryCache = new NodeCache();
//   private isReconnecting = false;

//   constructor() {
//     this.logger.level = 'silent';
//   }

//   public async start(config: NumberConfig) {
//     const { number } = config;
//     const authFolder = `authFolder_${number}`;
//     const { state, saveCreds } = await useMultiFileAuthState(authFolder);
//     const { version } = await fetchLatestBaileysVersion();

//     this.sock = makeWASocket({
//       version,
//       logger: this.logger,
//       printQRInTerminal: true,
//       msgRetryCounterCache: this.retryCache,
//       auth: {
//         creds: state.creds,
//         keys: makeCacheableSignalKeyStore(state.keys, this.logger),
//       },
//       browser: Browsers.ubuntu(`MultiBot_${number}`),
//       generateHighQualityLinkPreview: true,
//     });

//     this.sock.ev.on('connection.update', (update) =>
//       this.onConnectionUpdate(sessionId, number, authFolder, update),
//     );
//     this.sock.ev.on('creds.update', saveCreds);
//     this.sock.ev.on('messages.update', (updates) =>
//       this.onMessageAckUpdates(sessionId, updates),
//     );
//     this.sock.ev.on('messages.upsert', async (upsert) =>
//       this.onIncomingMessages(sessionId, upsert),
//     );

//     console.log(`✅ Bot inicializado para ${number}`);
//   }

//   private async onConnectionUpdate(
//     sessionId: string,
//     number: string,
//     authFolder: string,
//     update: { connection?: string; lastDisconnect?: any; qr?: string },
//   ) {
//     const { connection, lastDisconnect, qr } = update;

//     if (qr) {
//       await this.updateSessionStatus.execute({
//         id: sessionId,
//         status: new SessionStatus('QR_PENDING'),
//       });
//     }

//     if (connection === 'close') {
//       if (this.isReconnecting) return;
//       this.isReconnecting = true;

//       const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;
//       if (statusCode === DisconnectReason.loggedOut) {
//         this.whatsAppLogger.logSessionEvent(
//           sessionId,
//           'LOGGED_OUT',
//           `Sesión cerrada para ${number}, borrando credenciales...`,
//         );
//         try {
//           await fs.rm(authFolder, { recursive: true, force: true });
//           this.whatsAppLogger.logSessionEvent(
//             sessionId,
//             'INFO',
//             'Carpeta de autenticación eliminada.',
//           );
//         } catch (err) {
//           console.error('Error al borrar la carpeta de autenticación:', err);
//         }
//         await this.softDeleteSession.run(sessionId); // Marcar sesión como eliminada lógicamente
//       } else {
//         this.whatsAppLogger.logSessionEvent(
//           sessionId,
//           'RECONNECTING',
//           `Reconectando ${number}...`,
//         );
//         await this.updateSessionStatus({
//           id: sessionId,
//           status: new SessionStatus('RECONNECTING'),
//         });
//       }
//       await this.restartBot({ number, authFolder });
//       this.isReconnecting = false;
//     } else if (connection === 'open') {
//       this.whatsAppLogger.logSessionEvent(
//         sessionId,
//         'CONNECTED',
//         `Conexión abierta para ${number}`,
//       );
//       await this.updateSessionStatus.execute({
//         id: sessionId,
//         status: new SessionStatus('CONNECTED'),
//       });
//     }
//   }

//   private async onMessageAckUpdates(sessionId: string, updates: any[]) {
//     for (const u of updates) {
//       if (!u.key.fromMe) continue; // Solo nos interesan los mensajes que enviamos
//       const status = u.update?.status;
//       if (status !== undefined) {
//         // Mapear el estado de Baileys a un nombre legible de tu tabla `status`
//         let statusName: string;
//         switch (status) {
//           case proto.WebMessageInfo.Status.SERVER_ACK:
//             statusName = 'SERVER_ACK';
//             break;
//           case proto.WebMessageInfo.Status.DELIVERY_ACK:
//             statusName = 'DELIVERY_ACK';
//             break;
//           case proto.WebMessageInfo.Status.READ:
//             statusName = 'READ';
//             break;
//           case proto.WebMessageInfo.Status.PLAYED:
//             statusName = 'PLAYED';
//             break;
//           default:
//             statusName = 'UNKNOWN';
//             break; // O manejar otros estados
//         }
//         if (status === 6) statusName = 'FAILED'; // Tu estado de "entrega fallida"

//         this.whatsAppLogger.logStatus(u.key.id, status, sessionId);
//         await this.updateMessageStatus.execute(u.key.id, statusName); // Actualizar `message_status`
//       }
//     }
//   }

//   private async onIncomingMessages(sessionId: string, upsert: any) {
//     if (upsert.type !== 'notify' || !this.sock) return;

//     for (const msg of upsert.messages) {
//       const to = msg.key.remoteJid.split('@')[0]; // El número del remitente
//       if (msg.key.fromMe) continue; // Ignorar mensajes enviados por nosotros mismos
//       if (isJidNewsletter(msg.key.remoteJid!)) continue; // Ignorar newsletters

//       this.whatsAppLogger.logSessionEvent(
//         sessionId,
//         'MESSAGE_RECEIVED',
//         `Nuevo mensaje de ${msg.key.remoteJid}`,
//       );
//       this.whatsAppLogger.logStatus(msg.key.id, 0, sessionId); // Logear el estado inicial

//       await this.sock.readMessages([msg.key]); // Marcar como leído en WhatsApp

//       // --- Crear entrada en la tabla `messages` ---
//       const messageId = new MessageId(msg.key.id);
//       const session_id = new SessionId(sessionId);
//       const inOut = new MessageInOut('in');
//       const createdAt = new Date(msg.messageTimestamp * 1000); // Baileys timestamp is in seconds

//       let messageType: MessageType;
//       let quotedMessageId: MessageQuotedMessageId = new MessageQuotedMessageId(
//         null,
//       );

//       if (msg.message?.conversation || msg.message?.extendedTextMessage?.text) {
//         messageType = new MessageType('text');
//         const textContent =
//           msg.message?.conversation || msg.message?.extendedTextMessage?.text;
//         // Persistir en `text_messages`
//         // Asumiendo que `createTextMessage` es un caso de uso que toma `messageId` y `body`

//         await this.createMessage.run(
//           messageId.value,
//           inOut.value,
//           messageType.value,
//           quotedMessageId.value,
//           sessionId,
//           to,
//           createdAt,
//         );
//         await this.createTextMessage.execute(messageId.value, textContent);
//       } else if (
//         msg.message?.imageMessage ||
//         msg.message?.videoMessage ||
//         msg.message?.audioMessage ||
//         msg.message?.stickerMessage ||
//         msg.message?.documentMessage
//       ) {
//         const mediaKeys = Object.keys(msg.message);
//         const baileyMediaType = mediaKeys.find((k) => k.endsWith('Message'));

//         if (baileyMediaType) {
//           messageType = new MessageType(baileyMediaType.replace('Message', '')); // ej: 'image', 'video'
//           // Persistir en `media_messages`
//           // Descargar y obtener la ruta del archivo
//           const filePath = await this.downloadMediaMessage.execute(
//             sessionId,
//             msg,
//           );
//           if (filePath) {
//             const mediaMessagePayload = {
//               messageId: messageId.value,
//               caption: msg.message[baileyMediaType]?.caption || null,
//               mediaType: messageType.value,
//               fileName:
//                 msg.message[baileyMediaType]?.fileName ||
//                 path.basename(filePath),
//               filePath: filePath,
//             };
//             await this.createMessage.execute(
//               new Message(messageId, session_id, messageType, inOut, createdAt),
//             );
//             await this.createMediaMessage.execute(mediaMessagePayload);
//           }
//         }
//       } else if (msg.message?.reactionMessage) {
//         messageType = new MessageType('reaction');
//         quotedMessageId = new MessageQuotedMessageId(
//           msg.message.reactionMessage.key.id,
//         );
//         // Persistir en `reaction_messages`
//         // Asumiendo que `createReactionMessage` es un caso de uso
//         await this.createMessage.execute(
//           new Message(
//             messageId,
//             session_id,
//             messageType,
//             inOut,
//             createdAt,
//             quotedMessageId,
//           ),
//         );
//         await this.createReactionMessage.execute(
//           messageId.value,
//           msg.message.reactionMessage.text,
//           quotedMessageId.value,
//         );
//       } else {
//         messageType = new MessageType('unknown'); // Para tipos de mensaje no manejados
//         await this.createMessage.execute(
//           new Message(messageId, session_id, messageType, inOut, createdAt),
//         );
//       }

//       // Obtener el quoted_message_id si existe
//       if (msg.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
//         const quotedId = msg.message.extendedTextMessage.contextInfo.stanzaId;
//         // Si ya se creó, actualizar el campo quoted_message_id en la tabla messages
//         // O si se maneja desde el constructor de Message, asegurar que se pase
//         if (quotedId) {
//           // Aquí deberías tener un método para actualizar `quoted_message_id`
//           // en tu `MessageRepository` o en un caso de uso de actualización de mensaje.
//           // For simplicity, let's assume it's set during creation now.
//         }
//       }

//       // --- Ejemplo de respuesta automática (fuera del scope de persistencia) ---
//       // Para una respuesta, crearía un NUEVO mensaje con in_out = 'out'
//       const newOutgoingMessageId = `msg_${randomUUID().substring(0, 20)}`; // Generar un ID de Baileys para el mensaje saliente
//       await this.sendMessageUseCase.execute(
//         sessionId,
//         to, // Destinatario es el remitente del mensaje original
//         'media', // Tipo de media a enviar
//         'video', // Tipo específico de media
//         {
//           url: './public/VID-20250513-WA0026.mp4',
//           caption: 'holisss',
//           quoted: { key: msg.key, message: msg.message },
//         },
//         newOutgoingMessageId, // Pasa el ID que se usará para el mensaje saliente
//       );

//       // Después de enviar, el `sendMessageUseCase` se encargará de crear
//       // la entrada en `messages`, `media_messages` y `message_status` para el mensaje saliente.
//     }
//   }

//   private async restartBot(config: NumberConfig) {
//     const sessionId = new SessionId(`sock_${config.number}`).value;
//     if (this.sock) {
//       try {
//         this.whatsAppLogger.logSessionEvent(
//           sessionId,
//           'INFO',
//           `Cerrando sesión previa para ${config.number}`,
//         );
//         this.sock.end(undefined);
//       } catch (e) {
//         this.whatsAppLogger.logSessionEvent(
//           sessionId,
//           'ERROR',
//           `Error cerrando sesión previa para ${config.number}: ${e.message}`,
//         );
//       }
//       this.sock = null;
//     }
//     await this.start(config);
//   }
// }
