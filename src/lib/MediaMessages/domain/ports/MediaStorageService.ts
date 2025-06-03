export interface MediaUploadResult {
  success: boolean;
  url: string;
  key?: string;
  error?: string;
}

export interface MediaStorageService {
  uploadBuffer(
    buffer: Buffer,
    fileName: string,
    sessionId: string,
    messageId: string,
    mediaType: 'image' | 'video' | 'audio' | 'document' | 'sticker',
    mimeType?: string
  ): Promise<MediaUploadResult>;

  uploadFromPath(
    filePath: string,
    sessionId: string,
    messageId: string,
    mediaType: 'image' | 'video' | 'audio' | 'document' | 'sticker'
  ): Promise<MediaUploadResult>;

  deleteMedia(keys: string[]): Promise<boolean>;
}