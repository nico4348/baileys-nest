import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FileStorage {
  private readonly tempDir = './temp-uploads';

  constructor() {
    this.ensureTempDirExists();
  }

  private ensureTempDirExists(): void {
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  async storeTemporaryFile(sessionMediaId: string, fileBuffer: Buffer): Promise<string> {
    const filePath = path.join(this.tempDir, `${sessionMediaId}.tmp`);
    await fs.promises.writeFile(filePath, fileBuffer);
    return filePath;
  }

  async getTemporaryFile(sessionMediaId: string): Promise<Buffer> {
    const filePath = path.join(this.tempDir, `${sessionMediaId}.tmp`);
    return await fs.promises.readFile(filePath);
  }

  async deleteTemporaryFile(sessionMediaId: string): Promise<void> {
    const filePath = path.join(this.tempDir, `${sessionMediaId}.tmp`);
    try {
      await fs.promises.unlink(filePath);
    } catch (error) {
      console.warn(`Failed to delete temporary file ${filePath}:`, error);
    }
  }
}