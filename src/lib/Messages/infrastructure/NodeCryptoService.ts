import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { CryptoService } from '../domain/ports/CryptoService';

@Injectable()
export class NodeCryptoService implements CryptoService {
  generateUUID(): string {
    return randomUUID();
  }
}
