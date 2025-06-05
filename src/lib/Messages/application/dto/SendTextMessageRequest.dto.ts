import {
  IsString,
  IsNotEmpty,
  IsOptional,
  ValidateNested,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';

export class TextData {
  @IsString()
  @IsNotEmpty()
  text: string;
}

export class SendTextMessageRequest {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  sessionId: string;

  @IsString()
  @IsNotEmpty()
  to: string;

  @IsOptional()
  @IsString()
  @IsUUID()
  quotedMessageId?: string;

  @ValidateNested()
  @Type(() => TextData)
  textData: TextData;
}
