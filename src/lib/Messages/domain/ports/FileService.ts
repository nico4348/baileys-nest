export interface FileService {
  getFileName(url: string): string;
  getMimeType(url: string): string;
}