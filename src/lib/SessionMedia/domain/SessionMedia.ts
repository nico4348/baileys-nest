import { SessionMediaId } from './SessionMediaId';
import { SessionMediaSessionId } from './SessionMediaSessionId';
import { SessionMediaS3Url } from './SessionMediaS3Url';
import { SessionMediaFileName } from './SessionMediaFileName';
import { SessionMediaType } from './SessionMediaType';
import { SessionMediaDescription } from './SessionMediaDescription';
import { SessionMediaCreatedAt } from './SessionMediaCreatedAt';

export class SessionMedia {
  constructor(
    private readonly id: SessionMediaId,
    private readonly sessionId: SessionMediaSessionId,
    private readonly s3Url: SessionMediaS3Url,
    private readonly fileName: SessionMediaFileName,
    private readonly mediaType: SessionMediaType,
    private readonly description: SessionMediaDescription,
    private readonly createdAt: SessionMediaCreatedAt,
  ) {}

  getId(): SessionMediaId {
    return this.id;
  }

  getSessionId(): SessionMediaSessionId {
    return this.sessionId;
  }

  getS3Url(): SessionMediaS3Url {
    return this.s3Url;
  }

  getFileName(): SessionMediaFileName {
    return this.fileName;
  }

  getMediaType(): SessionMediaType {
    return this.mediaType;
  }

  getDescription(): SessionMediaDescription {
    return this.description;
  }

  getCreatedAt(): SessionMediaCreatedAt {
    return this.createdAt;
  }

  static create(
    id: string,
    sessionId: string,
    s3Url: string,
    fileName: string,
    mediaType: string,
    description?: string,
    createdAt?: Date,
  ): SessionMedia {
    return new SessionMedia(
      new SessionMediaId(id),
      new SessionMediaSessionId(sessionId),
      new SessionMediaS3Url(s3Url),
      new SessionMediaFileName(fileName),
      new SessionMediaType(mediaType),
      new SessionMediaDescription(description || ''),
      new SessionMediaCreatedAt(createdAt || new Date()),
    );
  }
}