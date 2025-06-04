import { Injectable, Inject } from '@nestjs/common';
import { SessionMediaRepository } from '../domain/SessionMediaRepository';
import { SessionMedia } from '../domain/SessionMedia';
import { v4 as uuidv4 } from 'uuid';

export interface CreateSessionMediaRequest {
  sessionId: string;
  s3Url: string;
  fileName: string;
  mediaType: string;
  description?: string;
  isUploaded?: boolean;
}

@Injectable()
export class SessionMediaCreate {
  constructor(@Inject('SessionMediaRepository') private readonly repository: SessionMediaRepository) {}

  async execute(request: CreateSessionMediaRequest): Promise<SessionMedia> {
    const sessionMedia = SessionMedia.create(
      uuidv4(),
      request.sessionId,
      request.s3Url,
      request.fileName,
      request.mediaType,
      request.description,
      request.isUploaded,
    );

    return await this.repository.create(sessionMedia);
  }
}