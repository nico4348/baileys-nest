import { Injectable } from '@nestjs/common';
import * as path from 'path';
import { lookup } from 'mime-types';
import { FileService } from '../domain/ports/FileService';

@Injectable()
export class NodeFileService implements FileService {
  getFileName(url: string): string {
    return path.basename(url);
  }

  getMimeType(url: string): string {
    return lookup(url) || 'application/octet-stream';
  }
}