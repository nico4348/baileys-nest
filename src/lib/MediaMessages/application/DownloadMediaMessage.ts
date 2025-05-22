// // src/lib/MediaMessages/application/DownloadMediaMessage.ts
// import { Injectable } from '@nestjs/common';
// import { MediaMessageRepository } from '../domain/MediaMessageRepository';
// // import { BaileysMediaDownloader } from '../infrastructure/BaileysMediaDownloader';
// import { MessageId } from '../../Messages/domain/MessageId';
// import { MediaMessage } from '../domain/MediaMessage';
// import { randomUUID } from 'crypto';
// import * as path from 'path';
// import { MessageType } from '../../Messages/domain/MessageType';

// @Injectable()
// export class DownloadMediaMessage {
//   constructor(
//     private readonly mediaMessageRepository: MediaMessageRepository,
//     private readonly baileysMediaDownloader: BaileysMediaDownloader,
//   ) {}

//   async execute(sessionId: string, msg: any): Promise<string | null> {
//     const filePath = await this.baileysMediaDownloader.downloadMedia(
//       sessionId,
//       msg,
//     );

//     if (filePath) {
//       const mediaTypeBaileys = Object.keys(msg.message || {})[0]?.replace(
//         'Message',
//         '',
//       );
//       const mediaMessageEntity = new MediaMessage(
//         new MessageId(randomUUID()), // Nuevo UUID para PK
//         new MessageId(msg.key.id), // FK a messages
//         msg.message[Object.keys(msg.message || {})[0]]?.caption || null, // Caption
//         new MessageType(mediaTypeBaileys), // media_type
//         path.basename(filePath), // file_name
//         filePath, // file_path
//       );
//       await this.mediaMessageRepository.save(mediaMessageEntity); // Persistir en `media_messages`
//     }
//     return filePath;
//   }
// }
