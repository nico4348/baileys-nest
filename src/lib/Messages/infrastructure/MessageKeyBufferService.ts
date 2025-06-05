// Servicio singleton para almacenar msgKeys agrupados por chat (jid)
import { Injectable } from '@nestjs/common';

@Injectable()
export class MessageKeyBufferService {
  private buffer: Map<string, Array<any>> = new Map(); // jid -> [msgKey]

  add(jid: string, msgKey: any) {
    if (!this.buffer.has(jid)) {
      this.buffer.set(jid, []);
    }
    this.buffer.get(jid)!.push(msgKey);
  }

  getAndClear(jid: string): Array<any> {
    const keys = this.buffer.get(jid) || [];
    this.buffer.set(jid, []);
    return keys;
  }
}
