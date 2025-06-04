import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';

export class UploadFileRequestDto {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  @Transform(({ value }) => value?.trim())
  sessionId: string;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  description?: string;
}