import {
  IsString,
  IsNotEmpty,
  IsOptional,
  ValidateNested,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ReactionData {
  @IsString()
  @IsNotEmpty()
  emoji: string;

  @IsString()
  @IsNotEmpty()
  targetMessageId: string;

  @IsOptional()
  messageKey?: any;
}

export class SendReactionMessageRequest {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  sessionId: string;

  @IsString()
  @IsNotEmpty()
  to: string;

  @ValidateNested()
  @Type(() => ReactionData)
  reactionData: ReactionData;
}
