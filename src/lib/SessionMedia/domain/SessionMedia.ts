import { SessionMediaId } from './SessionMediaId';
import { SessionMediaSessionId } from './SessionMediaSessionId';
import { SessionMediaS3Url } from './SessionMediaS3Url';
import { SessionMediaFileName } from './SessionMediaFileName';
import { SessionMediaType } from './SessionMediaType';
import { SessionMediaDescription } from './SessionMediaDescription';
import { SessionMediaCreatedAt } from './SessionMediaCreatedAt';
import { SessionMediaIsUploaded } from './SessionMediaIsUploaded';

export class SessionMedia {
  constructor(
    private readonly id: SessionMediaId,
    private readonly sessionId: SessionMediaSessionId,
    private readonly s3Url: SessionMediaS3Url,
    private readonly fileName: SessionMediaFileName,
    private readonly mediaType: SessionMediaType,
    private readonly description: SessionMediaDescription,
    private readonly isUploaded: SessionMediaIsUploaded,
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

  getIsUploaded(): SessionMediaIsUploaded {
    return this.isUploaded;
  }

  getCreatedAt(): SessionMediaCreatedAt {
    return this.createdAt;
  }

  updateS3Url(newS3Url: string): SessionMedia {
    return new SessionMedia(
      this.id,
      this.sessionId,
      new SessionMediaS3Url(newS3Url),
      this.fileName,
      this.mediaType,
      this.description,
      this.isUploaded,
      this.createdAt,
    );
  }

  markAsUploaded(): SessionMedia {
    return new SessionMedia(
      this.id,
      this.sessionId,
      this.s3Url,
      this.fileName,
      this.mediaType,
      this.description,
      new SessionMediaIsUploaded(true),
      this.createdAt,
    );
  }

  static create(
    id: string,
    sessionId: string,
    s3Url: string,
    fileName: string,
    mediaType: string,
    description?: string,
    isUploaded?: boolean,
    createdAt?: Date,
  ): SessionMedia {
    return new SessionMedia(
      new SessionMediaId(id),
      new SessionMediaSessionId(sessionId),
      new SessionMediaS3Url(s3Url),
      new SessionMediaFileName(fileName),
      new SessionMediaType(mediaType),
      new SessionMediaDescription(description || ''),
      new SessionMediaIsUploaded(isUploaded || false),
      new SessionMediaCreatedAt(createdAt || new Date()),
    );
  }
}