import {
  IsString,
  IsEnum,
  IsOptional,
  ValidateNested,
  IsNotEmpty,
  IsPhoneNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum MessageType {
  TEXT = 'text',
  MEDIA = 'media',
  REACTION = 'reaction',
}

export class BaseMessageRequest {
  @IsString()
  @IsNotEmpty()
  sessionId: string;

  @IsString()
  @IsNotEmpty()
  to: string;

  @IsEnum(MessageType)
  messageType: MessageType;

  @IsOptional()
  @IsString()
  quotedMessageId?: string;
}

export class TextMessageData {
  @IsString()
  @IsNotEmpty()
  text: string;
}

export class MediaMessageData {
  @IsString()
  @IsNotEmpty()
  url: string;

  @IsString()
  @IsNotEmpty()
  mediaType: string; // 'image', 'video', 'audio', 'document', 'voiceNote', 'sticker'

  @IsOptional()
  @IsString()
  caption?: string;

  @IsOptional()
  @IsString()
  mimeType?: string;

  @IsOptional()
  @IsString()
  fileName?: string;
}

export class ReactionMessageData {
  @IsString()
  @IsNotEmpty()
  emoji: string;

  @IsOptional()
  targetMessageId?: any; // Acepta objeto JSON completo, UUID o string con clave de Baileys

  @IsOptional()
  messageKey?: any;
}

export class SendMessageRequest extends BaseMessageRequest {
  @IsOptional()
  @ValidateNested()
  @Type(() => TextMessageData)
  textData?: TextMessageData;

  @IsOptional()
  @ValidateNested()
  @Type(() => MediaMessageData)
  mediaData?: MediaMessageData;

  @IsOptional()
  @ValidateNested()
  @Type(() => ReactionMessageData)
  reactionData?: ReactionMessageData;
}
