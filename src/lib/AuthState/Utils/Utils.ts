import { Buffer } from 'buffer';

export class BufferConverter {
  bufferToJSON(obj: any): any {
    if (Buffer.isBuffer(obj)) {
      return { type: 'Buffer', data: Array.from(obj) };
    } else if (Array.isArray(obj)) {
      return obj.map((item) => this.bufferToJSON(item));
    } else if (typeof obj === 'object' && obj !== null) {
      if (typeof obj.toJSON === 'function') {
        return obj.toJSON();
      }
      const result: { [key: string]: any } = {};
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          result[key] = this.bufferToJSON(obj[key]);
        }
      }
      return result;
    }
    return obj;
  }

  jsonToBuffer(obj: any): any {
    if (obj && obj.type === 'Buffer' && Array.isArray(obj.data)) {
      return Buffer.from(obj.data);
    } else if (Array.isArray(obj)) {
      return obj.map((item) => this.jsonToBuffer(item));
    } else if (typeof obj === 'object' && obj !== null) {
      const result: { [key: string]: any } = {};
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          result[key] = this.jsonToBuffer(obj[key]);
        }
      }
      return result;
    }
    return obj;
  }
}
