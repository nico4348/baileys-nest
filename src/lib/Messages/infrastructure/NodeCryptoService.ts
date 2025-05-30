import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { CryptoService } from '../domain/ports/CryptoService';

@Injectable()
export class NodeCryptoService implements CryptoService {
  generateUUID(): string {
    return crypto.randomUUID();
  }
}