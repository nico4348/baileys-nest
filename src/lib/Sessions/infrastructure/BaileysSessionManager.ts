// // src/lib/Sessions/infrastructure/SessionStartSocket.ts
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
// import * as fs from 'fs/promises';
// import { randomUUID } from 'crypto'; // You'll need this import for generating UUIDs
// import * as path from 'path'; // You'll need this import for path manipulation

// // Use Cases (Application Layer)
// import { SessionsCreate } from '../application/SessionsCreate';
// import { SessionsUpdate } from '../application/SessionsUpdate'; // For updating session status
// import { SessionSoftDelete } from '../application/SessionSoftDelete'; // For soft deleting sessions

// // TODO: You'll need to define and import these application use cases for messages and media.
// // These are placeholders for now based on your commented-out imports and usage.
// import { MessageCreate } from '../../Messages/application/MessageCreate'; // Assuming a use case for creating message entries
// import { MessageStatusUpdate } from '../../MessageStatus/application/MessageStatusUpdate'; // Assuming a use case for updating message status
// import { DownloadMediaMessage } from '../../MediaMessages/application/DownloadMediaMessage'; // Assuming a use case for downloading media
// import { CreateTextMessage } from '../../Messages/application/CreateTextMessage'; // Assuming a use case for creating text message entries
// import { CreateMediaMessage } from '../../Messages/application/CreateMediaMessage'; // Assuming a use case for creating media message entries
// import { ReactionMessagesCreate } from '../../ReactionMessages/application/ReactionMessagesCreate'; // Assuming a use case for creating reaction message entries
// import { SendMessageUseCase } from '../../Messages/application/SendMessageUseCase'; // Assuming a use case for sending messages

// // Value Objects (Domain Layer)
// import { SessionId } from '../domain/SessionId';
// import { SessionStatus } from '../domain/SessionStatus';
// import { MessageId } from '../../Messages/domain/MessageId'; // Assuming you have a MessageId VO
// import { MessageInOut } from '../../Messages/domain/MessageInOut'; // Assuming you have a MessageInOut VO
// import { MessageMessageType } from '../../Messages/domain/MessageMessageType'; // Assuming you have a MessageMessageType VO
// import { MessageQuotedMessageId } from '../../Messages/domain/MessageQuotedMessageId'; // Assuming you have a MessageQuotedMessageId VO

// // Helper for logging (consider moving to a shared logging module or adapting to NestJS logging)
// class WhatsAppLogger {
//   logSessionEvent(sessionId: string, event: string, message: string) {
//     console.log(`[Session ${sessionId}] [${event}]: ${message}`);
//   }
//   logStatus(messageId: string, status: number, sessionId: string) {
//     console.log(
//       `[Session ${sessionId}] Message ID: ${messageId}, Status: ${status}`,
//     );
//   }
// }

// interface NumberConfig {
//   number: string;
//   authFolder: string;
//   sessionName: string; // Add sessionName to config for session creation
// }

// @Injectable()
// export class SessionStartSocket {
//   private sock: ReturnType<typeof makeWASocket> | null = null;
//   private logger = P.pino(
//     { timestamp: () => `,'time':'${new Date().toISOString()}'` },
//     P.destination('./wa-logs.txt'),
//   );
//   private retryCache = new NodeCache();
//   private isReconnecting = false;
//   private whatsAppLogger = new WhatsAppLogger(); // Instance of the logger

//   constructor(
//     private readonly sessionsCreate: SessionsCreate, // Use case to create a session
//     private readonly sessionsUpdate: SessionsUpdate, // Use case to update session status
//     private readonly sessionSoftDelete: SessionSoftDelete, // Use case to soft delete a session
//     // Message related use cases
//     private readonly messageCreate: MessageCreate,
//     private readonly messageStatusUpdate: MessageStatusUpdate,
//     private readonly downloadMediaMessage: DownloadMediaMessage,
//     private readonly createTextMessage: CreateTextMessage,
//     private readonly createMediaMessage: CreateMediaMessage,
//     private readonly createReactionMessage: ReactionMessagesCreate,
//     private readonly sendMessageUseCase: SendMessageUseCase,
//   ) {
//     this.logger.level = 'silent'; // Set pino logger level
//   }

//   public async start(config: NumberConfig): Promise<string> {
//     const { number, sessionName, authFolder } = config;
//     const sessionId = new SessionId(`sock_${number}`).value; // Generate a unique session ID

//     // Create or update session in the database
//     const now = new Date();
//     await this.sessionsCreate.run(
//       sessionId,
//       sessionName,
//       number,
//       false, // Initial status: not connected
//       now,
//       now,
//       false, // Not deleted
//     );

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
//     return sessionId; // Return the generated sessionId
//   }

//   private async onConnectionUpdate(
//     sessionId: string,
//     number: string,
//     authFolder: string,
//     update: { connection?: string; lastDisconnect?: any; qr?: string },
//   ) {
//     const { connection, lastDisconnect, qr } = update;

//     if (qr) {
//       await this.sessionsUpdate.run(
//         sessionId,
//         'N/A', // Session Name (update only status)
//         number,
//         false, // Placeholder for actual status boolean conversion
//         new Date(), // Placeholder for created_at
//         new Date(), // Placeholder for updated_at
//         false, // Placeholder for is_deleted
//       );
//       this.whatsAppLogger.logSessionEvent(
//         sessionId,
//         'QR_PENDING',
//         `QR disponible para ${number}`,
//       );
//       // In a real scenario, you'd emit this QR code to the frontend
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
//         await this.sessionSoftDelete.run(sessionId); // Marcar sesión como eliminada lógicamente
//       } else {
//         this.whatsAppLogger.logSessionEvent(
//           sessionId,
//           'RECONNECTING',
//           `Reconectando ${number}...`,
//         );
//         await this.sessionsUpdate.run(
//           sessionId,
//           'N/A', // Session Name (update only status)
//           number,
//           false, // Placeholder for actual status boolean conversion
//           new Date(), // Placeholder for created_at
//           new Date(), // Placeholder for updated_at
//           false, // Placeholder for is_deleted
//         );
//       }
//       await this.restartBot({ number, authFolder, sessionName: 'N/A' }); // Pass sessionName
//       this.isReconnecting = false;
//     } else if (connection === 'open') {
//       this.whatsAppLogger.logSessionEvent(
//         sessionId,
//         'CONNECTED',
//         `Conexión abierta para ${number}`,
//       );
//       await this.sessionsUpdate.run(
//         sessionId,
//         'N/A', // Session Name (update only status)
//         number,
//         true, // Connected status
//         new Date(), // Placeholder for created_at
//         new Date(), // Placeholder for updated_at
//         false, // Placeholder for is_deleted
//       );
//     }
//   }

//   private async onMessageAckUpdates(sessionId: string, updates: any[]) {
//     for (const u of updates) {
//       if (!u.key.fromMe) continue; // Only interested in messages we sent
//       const status = u.update?.status;
//       if (status !== undefined) {
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
//             break;
//         }
//         if (status === 6) statusName = 'FAILED';

//         this.whatsAppLogger.logStatus(u.key.id, status, sessionId);
//         await this.messageStatusUpdate.run(u.key.id, statusName); // Use the message status update use case
//       }
//     }
//   }

//   private async onIncomingMessages(sessionId: string, upsert: any) {
//     if (upsert.type !== 'notify' || !this.sock) return;

//     for (const msg of upsert.messages) {
//       const to = msg.key.remoteJid.split('@')[0];
//       if (msg.key.fromMe) continue;
//       if (isJidNewsletter(msg.key.remoteJid!)) continue;

//       this.whatsAppLogger.logSessionEvent(
//         sessionId,
//         'MESSAGE_RECEIVED',
//         `Nuevo mensaje de ${msg.key.remoteJid}`,
//       );
//       this.whatsAppLogger.logStatus(msg.key.id, 0, sessionId);

//       await this.sock.readMessages([msg.key]);

//       const messageId = new MessageId(msg.key.id).value;
//       const session_id_vo = new SessionId(sessionId); // Renamed to avoid conflict
//       const inOut = new MessageInOut('in');
//       const createdAt = new Date(msg.messageTimestamp * 1000);

//       let messageType: MessageMessageType;
//       let quotedMessageId: MessageQuotedMessageId = new MessageQuotedMessageId(
//         null,
//       );

//       if (msg.message?.conversation || msg.message?.extendedTextMessage?.text) {
//         messageType = new MessageMessageType('text');
//         const textContent =
//           msg.message?.conversation || msg.message?.extendedTextMessage?.text;

//         await this.messageCreate.run(
//           messageId,
//           inOut.value,
//           messageType.value,
//           quotedMessageId.value,
//           session_id_vo.value,
//           to, // 'to' here is the sender of the incoming message
//           createdAt,
//         );
//         await this.createTextMessage.run(messageId, textContent);
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
//           messageType = new MessageMessageType(
//             baileyMediaType.replace('Message', ''),
//           );
//           const filePath = await this.downloadMediaMessage.run(sessionId, msg);
//           if (filePath) {
//             await this.messageCreate.run(
//               messageId,
//               inOut.value,
//               messageType.value,
//               quotedMessageId.value,
//               session_id_vo.value,
//               to,
//               createdAt,
//             );
//             await this.createMediaMessage.run(
//               messageId,
//               msg.message[baileyMediaType]?.caption || null,
//               messageType.value,
//               msg.message[baileyMediaType]?.fileName || path.basename(filePath),
//               filePath,
//             );
//           }
//         }
//       } else if (msg.message?.reactionMessage) {
//         messageType = new MessageMessageType('reaction');
//         quotedMessageId = new MessageQuotedMessageId(
//           msg.message.reactionMessage.key.id,
//         );
//         await this.messageCreate.run(
//           messageId,
//           inOut.value,
//           messageType.value,
//           quotedMessageId.value,
//           session_id_vo.value,
//           to,
//           createdAt,
//         );
//         await this.createReactionMessage.run(
//           messageId,
//           msg.message.reactionMessage.text,
//           quotedMessageId.value,
//         );
//       } else {
//         messageType = new MessageMessageType('unknown');
//         await this.messageCreate.run(
//           messageId,
//           inOut.value,
//           messageType.value,
//           quotedMessageId.value,
//           session_id_vo.value,
//           to,
//           createdAt,
//         );
//       }

//       // Handle quoted messages
//       if (msg.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
//         const quotedId = msg.message.extendedTextMessage.contextInfo.stanzaId;
//         if (quotedId) {
//           // If you have a use case to update message with quoted ID, use it here
//           // e.g., await this.messageUpdate.run(messageId, { quotedMessageId: quotedId });
//         }
//       }

//       // Example of automatic response (using the SendMessageUseCase)
//       const newOutgoingMessageId = `msg_${randomUUID().substring(0, 20)}`;
//       await this.sendMessageUseCase.run(
//         sessionId,
//         to, // Recipient is the sender of the original message
//         'media', // Type of media to send
//         'video', // Specific media type
//         {
//           url: './public/VID-20250513-WA0026.mp4',
//           caption: 'holisss',
//           quoted: { key: msg.key, message: msg.message },
//         },
//         newOutgoingMessageId,
//       );
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
