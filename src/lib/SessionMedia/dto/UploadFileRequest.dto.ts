import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class UploadFileRequestDto {
  @IsString()
  @IsNotEmpty()
  sessionId: string;

  @IsString()
  @IsOptional()
  description?: string;
}