import {
  IsString,
  IsNotEmpty,
  IsOptional,
  ValidateNested,
  IsUUID,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum MediaType {
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
  DOCUMENT = 'document',
  STICKER = 'sticker',
  VOICE_NOTE = 'voiceNote',
}

export class MediaData {
  @IsString()
  @IsNotEmpty()
  url: string;

  @IsEnum(MediaType)
  mediaType: MediaType;

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

export class SendMediaMessageRequest {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  sessionId: string;

  @IsString()
  @IsNotEmpty()
  to: string;

  @IsOptional()
  @IsString()
  quotedMessageId?: string;

  @ValidateNested()
  @Type(() => MediaData)
  mediaData: MediaData;
}
