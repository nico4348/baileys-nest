export class SessionMediaS3Url {
  constructor(private readonly value: string) {
    // Allow empty S3 URL for pending uploads
  }

  toString(): string {
    return this.value;
  }

  equals(other: SessionMediaS3Url): boolean {
    return this.value === other.value;
  }
}