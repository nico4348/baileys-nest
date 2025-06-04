import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FileStorage {
  private readonly tempDir = './temp-uploads';
  private readonly logger = new Logger(FileStorage.name);

  constructor() {
    this.ensureTempDirExists();
    this.scheduleCleanup();
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
      this.logger.warn(`Failed to delete temporary file ${filePath}:`, error);
    }
  }

  private scheduleCleanup(): void {
    // Clean up files older than 1 hour every 30 minutes
    setInterval(async () => {
      await this.cleanupOldFiles();
    }, 30 * 60 * 1000); // 30 minutes
  }

  private async cleanupOldFiles(): Promise<void> {
    try {
      const files = await fs.promises.readdir(this.tempDir);
      const oneHourAgo = Date.now() - (60 * 60 * 1000); // 1 hour

      for (const file of files) {
        if (file.endsWith('.tmp')) {
          const filePath = path.join(this.tempDir, file);
          const stats = await fs.promises.stat(filePath);
          
          if (stats.mtime.getTime() < oneHourAgo) {
            await fs.promises.unlink(filePath);
            this.logger.log(`Cleaned up old temporary file: ${file}`);
          }
        }
      }
    } catch (error) {
      this.logger.error('Failed to cleanup old temporary files:', error);
    }
  }
}