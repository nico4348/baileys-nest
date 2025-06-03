import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { SessionMediaRepository } from '../domain/SessionMediaRepository';
import { SessionMedia } from '../domain/SessionMedia';
import { SessionMediaId } from '../domain/SessionMediaId';

export interface UpdateSessionMediaRequest {
  id: string;
  sessionId?: string;
  s3Url?: string;
  fileName?: string;
  mediaType?: string;
  description?: string;
}

@Injectable()
export class SessionMediaUpdate {
  constructor(@Inject('SessionMediaRepository') private readonly repository: SessionMediaRepository) {}

  async execute(request: UpdateSessionMediaRequest): Promise<SessionMedia> {
    const sessionMediaId = new SessionMediaId(request.id);
    const existingSessionMedia = await this.repository.findById(sessionMediaId);
    
    if (!existingSessionMedia) {
      throw new NotFoundException(`SessionMedia with id ${request.id} not found`);
    }

    const updatedSessionMedia = SessionMedia.create(
      request.id,
      request.sessionId ?? existingSessionMedia.getSessionId().toString(),
      request.s3Url ?? existingSessionMedia.getS3Url().toString(),
      request.fileName ?? existingSessionMedia.getFileName().toString(),
      request.mediaType ?? existingSessionMedia.getMediaType().toString(),
      request.description ?? existingSessionMedia.getDescription().toString(),
      existingSessionMedia.getCreatedAt().toDate(),
    );

    return await this.repository.update(updatedSessionMedia);
  }
}